<?php
namespace YayWholesaleB2B\Controllers;

use Exception;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Registration Requests Endpoints.
 */
class RequestRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/requests',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_request_list' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'register_request' ],
                    'permission_callback' => [ $this, 'can_submit_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/(?P<request_id>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_request_by_id' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_request_by_id' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/(?P<request_id>\d+)/approve',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'approve_request_by_id' ],
                    'permission_callback' => [ $this,'can_manage_request_and_user_role' ],
                ],
            ]
        );
        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/(?P<request_id>\d+)/reject',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'reject_request_by_id' ],
                    'permission_callback' => [ $this,'can_manage_request_and_user_role' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/bulk-approve',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_approve_request' ],
                    'permission_callback' => [ $this,'can_manage_request_and_user_role' ],
                ],
            ]
        );
        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/bulk-reject',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_reject_request' ],
                    'permission_callback' => [ $this,'can_manage_request_and_user_role' ],
                ],
            ]
        );
        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/bulk-delete',
            [
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'bulk_delete_request' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/count-by-status',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'count_requests_by_status' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );
    }

    /**
     * Register a new wholesale request.
     *
     * @param WP_REST_Request $request
     * @return mixed|WP_Error
     */
    public function register_request( WP_REST_Request $request ) {

        if ( isset( $_COOKIE['yaywholesaleb2b_cid'] ) && ! empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            $cookie_id = sanitize_text_field( wp_unslash( $_COOKIE['yaywholesaleb2b_cid'] ) );
            $count     = (int) get_transient( "yaywholesaleb2b_client_$cookie_id" ) + 1;
            set_transient( "yaywholesaleb2b_client_$cookie_id", $count, 15 * MINUTE_IN_SECONDS );
        }

        $body_params                   = $request->get_body_params();
        $is_logged_in                  = is_user_logged_in();
        $current_user_id               = get_current_user_id();
        $is_current_wholesale_customer = CustomerHelper::is_current_wholesale_customer();
        $default_role                  = RolesHelper::get_default_wholesale_role();
        $settings                      = SettingsHelper::get_settings();
        $need_moderate                 = $settings['registration']['moderate'];

        if ( ! $is_logged_in || $need_moderate || empty( $default_role ) || $is_current_wholesale_customer ) {
            // When cannot auto-approved, set request to pending
            $new_request_id = RequestsHelper::insert_whs_request( $current_user_id, $body_params, RequestsHelper::STATUS_PENDING );
            if ( is_wp_error( $new_request_id ) ) {
                return $new_request_id;
            }

            do_action( 'ywhs_account_registration_submitted', $new_request_id );
            do_action( 'ywhs_account_registration_pending', $new_request_id );
            return [ 'message' => __( 'Your request has been submitted successfully.', 'yay-wholesale-b2b' ) ];

        } else {
            $new_request_id = RequestsHelper::insert_whs_request( $current_user_id, $body_params, RequestsHelper::STATUS_APPROVED );
            if ( is_wp_error( $new_request_id ) ) {
                return $new_request_id;
            }

            $current_user = wp_get_current_user();
            RolesHelper::remove_ywhs_role_from_user( $current_user );
            $current_user->add_role( $default_role['slug'] );

            do_action( 'ywhs_account_registration_submitted', $new_request_id );
            do_action( 'ywhs_account_registration_approved', $new_request_id );
            return [ 'message' => __( 'Your request has been submitted and approved. ', 'yay-wholesale-b2b' ) ];
        }//end if
    }

    public function get_request_list( WP_REST_Request $request ) {
        $page     = intval( $request->get_param( 'page' ) ?? 1 );
        $per_page = intval( $request->get_param( 'per_page' ) ?? 10 );
        $search   = sanitize_text_field( $request->get_param( 'search' ) ?? '' );
        $status   = sanitize_text_field( $request->get_param( 'status' ) ?? 'all' );

        $response = RequestsHelper::get_paginated_request_post( $search, $page, $per_page, $status );
        return $response;
    }

    public function get_request_by_id( WP_REST_Request $request ) {
        $request_id = (int) $request->get_param( 'request_id' );
        $request    = RequestsHelper::get_request_by_id( $request_id );

        if ( empty( $request ) ) {
            return $this->error_not_found();
        }

        return $request;
    }

    public function delete_request_by_id( WP_REST_Request $request ) {
        $id     = (int) $request->get_param( 'request_id' );
        $result = RequestsHelper::delete_whs_request( $id );

        return $result;
    }

    public function approve_request_by_id( WP_REST_Request $request ) {
        $request_id = (int) $request->get_param( 'request_id' );
        $payload    = $request->get_json_params();
        $role_slug  = $payload['roleSlug'];

        if ( empty( $role_slug ) || ! is_string( $role_slug ) ) {
            return $this->error_invalid_arguments();
        }

        $wholesale_request = RequestsHelper::get_request_by_id( $request_id );
        if ( empty( $wholesale_request ) ) {
            return $this->error_not_found();
        }

        $active_roles = RolesHelper::get_active_wholesale_roles();
        $role_config  = RolesHelper::get_role_by_slug( $active_roles, $role_slug );
        if ( empty( $role_config ) ) {
            return $this->error_invalid_arguments();
        }

        $success = RequestsHelper::approve_request( $request_id, $role_slug );
        if ( is_wp_error( $success ) ) {
            return $success;
        }

        $updated_request = RequestsHelper::get_request_by_id( $request_id );
        return $updated_request;
    }

    public function reject_request_by_id( WP_REST_Request $request ) {
        $request_id = (int) $request->get_param( 'request_id' );

        $wholesale_request = RequestsHelper::get_request_by_id( $request_id );
        if ( empty( $wholesale_request ) ) {
            return $this->error_not_found();
        }

        RequestsHelper::reject_request( $request_id );
        $updated_request = RequestsHelper::get_request_by_id( $request_id );
        return $updated_request;
    }

    public function bulk_approve_request( WP_REST_Request $request ) {
        $payload     = $request->get_json_params();
        $request_ids = $payload['requestIds'] ?? [];
        $role_slug   = $payload['roleSlug'];

        if ( empty( $request_ids ) || empty( $role_slug ) ) {
            return $this->error_invalid_arguments();
        }

        $active_roles = RolesHelper::get_active_wholesale_roles();
        $role_config  = RolesHelper::get_role_by_slug( $active_roles, $role_slug );
        if ( empty( $role_config ) ) {
            return $this->error_invalid_arguments();
        }

        $approved_count = 0;
        foreach ( $request_ids as $request_id ) {
            $success = RequestsHelper::approve_request( $request_id, $role_slug );
            if ( is_wp_error( $success ) ) {
                continue;
            }

            ++$approved_count;
        }

        return $approved_count;
    }

    public function bulk_reject_request( WP_REST_Request $request ) {
        $payload     = $request->get_json_params();
        $request_ids = $payload['requestIds'] ?? [];

        if ( empty( $request_ids ) ) {
            return $this->error_invalid_arguments();
        }

        $rejected_count = 0;
        foreach ( $request_ids as $request_id ) {
            RequestsHelper::reject_request( $request_id );
            ++$rejected_count;
        }

        return $rejected_count;
    }

    public function bulk_delete_request( WP_REST_Request $request ) {
        $payload     = $request->get_json_params();
        $request_ids = $payload['requestIds'] ?? [];

        if ( empty( $request_ids ) ) {
            return $this->error_invalid_arguments();
        }

        $deleted_count = 0;
        foreach ( $request_ids as $request_id ) {
            $result = RequestsHelper::delete_whs_request( $request_id );
            if ( $result === true ) {
                ++$deleted_count;
            }
        }

        return $deleted_count;
    }

    public function count_requests_by_status( WP_REST_Request $request ) {
        $count = RequestsHelper::count_requests_by_status( true );
        return $count;
    }

    /**
     * Check if the user reached the limit rate of sudmiting requests.
     *
     * @return bool.
     */
    private function check_submit_request_limit_rate() {
        if ( ! isset( $_COOKIE['yaywholesaleb2b_cid'] ) || empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            return false;
        }
        $cookie_id  = sanitize_text_field( wp_unslash( $_COOKIE['yaywholesaleb2b_cid'] ) );
        $count      = (int) get_transient( "yaywholesaleb2b_client_$cookie_id" ) + 1;
        $limit_rate = 5;

        return $count <= $limit_rate;
    }

    public function can_manage_request() {
        if ( current_user_can( 'edit_posts' ) && current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }

    public function can_manage_request_and_user_role() {
        if ( current_user_can( 'edit_posts' ) && current_user_can( 'create_users' ) && current_user_can( 'manage_woocommerce' ) && current_user_can( 'promote_users' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }

    public function can_submit_request( WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            $body_params = $request->get_body_params();
            global $current_user;

            if ( in_array( 'email_address', $body_params, true ) ) {
                if ( $body_params['email_address'] !== $current_user->user_email ) {
                    return $this->error_forbidden();
                }
            }
        }

        if ( ! isset( $_COOKIE['yaywholesaleb2b_cid'] ) || empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            return $this->error_forbidden( esc_html__( 'Cookie Error.', 'yay-wholesale-b2b' ) );
        }

        if ( ! $this->check_submit_request_limit_rate() ) {
            return $this->error_forbidden( esc_html__( 'You reached the limit requests you can send. Please try again in few minutes.', 'yay-wholesale-b2b' ) );
        }

        return true;
    }
}
