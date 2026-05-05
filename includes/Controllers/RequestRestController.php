<?php
namespace YayWholesaleB2B\Controllers;

use Exception;
use WP_Error;
use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Requests API endpoints.
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
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_request_by_id' ],
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
                    'callback'            => [ $this, 'approve_request_status_by_id' ],
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
                    'callback'            => [ $this, 'reject_request_status_by_id' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/bulk-approve',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_approve_request_status' ],
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
                    'callback'            => [ $this, 'bulk_reject_request_status' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/bulk-status',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_update_request_status' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
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
            '/requests/pending',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_pending_count' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/requests/total',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_total_count' ],
                    'permission_callback' => [ $this,'can_manage_request' ],
                ],
            ]
        );
    }

    /**
     * Register a new wholesale request.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function register_request( WP_REST_Request $request ): WP_REST_Response {

        if ( isset( $_COOKIE['yaywholesaleb2b_cid'] ) && ! empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            $cookie_id = sanitize_text_field( wp_unslash( $_COOKIE['yaywholesaleb2b_cid'] ) );
            $count     = (int) get_transient( "yaywholesaleb2b_client_$cookie_id" ) + 1;
            set_transient( "yaywholesaleb2b_client_$cookie_id", $count, 15 * MINUTE_IN_SECONDS );
        }

        $params       = $this->get_form_data( $request );
        $current_user = get_current_user_id();

        $wholesale_id = RequestsHelper::insert_whs_request( $current_user, $params );

        if ( $wholesale_id < 0 ) {
            return $this->error( __( 'Failed to register this request', 'yay-wholesale-b2b' ) );
        }

        $settings = SettingsHelper::get_settings();
        if ( ! $settings['registration']['moderate'] ) {
            $roles        = get_option( 'yaywholesaleb2b_roles', [] );
            $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );
            $role_slug    = $settings['general']['default_role'];
            $role         = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                do_action( 'ywhs_account_registration_pending', $wholesale_id );
                return $this->error( __( 'The default role is inactive, your request is changed to pending', 'yay-wholesale-b2b' ) );
            }

            $result = RequestsHelper::add_role_to_ywhs_request_author( $wholesale_id, $role_slug );

            if ( $result ) {
                if ( ! RequestsHelper::update_whs_request( $wholesale_id, [ 'status' => RequestsHelper::APPROVED ] ) ) {
                    do_action( 'ywhs_account_registration_pending', $wholesale_id );
                    return $this->error( __( 'Role has been applied, but your request is still pending', 'yay-wholesale-b2b' ) );
                }

                // Trigger the email when a new wholesale account is approved.
                do_action( 'ywhs_account_registration_approved', $wholesale_id );
            } else {
                // Trigger the email when a new wholesale account is pending.
                do_action( 'ywhs_account_registration_pending', $wholesale_id );
            }
        } else {
            // Trigger the email when a new wholesale account is pending.
            do_action( 'ywhs_account_registration_pending', $wholesale_id );
        }//end if

        return $this->success( true, __( 'Request Saved', 'yay-wholesale-b2b' ) );
    }

    /**
     * Get the list of wholesale requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_request_list( WP_REST_Request $request ): WP_REST_Response {
        $page     = $request['page'];
        $per_page = $request['per_page'];
        $keyword  = $request['kw'];
        $status   = $request['status'];

        if ( ! isset( $page ) ) {
            $page = 1;
        }

        if ( ! isset( $per_page ) ) {
            $per_page = 10;
        }

        if ( ! isset( $keyword ) ) {
            $keyword = '';
        }

        if ( ! isset( $status ) ) {
            $status = RequestsHelper::ALL;
        }

        $response = RequestsHelper::get_paginated_request_post( $keyword, $status, $page, $per_page );

        return $this->success( $response, __( 'Fetched successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Get a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id      = (int) $request->get_param( 'request_id' );
        $request = RequestsHelper::get_request_by_id( $id );

        if ( empty( $request ) ) {
            return $this->error( __( 'Request not found', 'yay-wholesale-b2b' ), 404 );
        }

        return $this->success( $request );
    }

    /**
     * Update a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id        = (int) $request->get_param( 'request_id' );
        $form_data = $this->get_json_params( $request );

        $result = RequestsHelper::update_whs_request( $id, $form_data );
        if ( ! $result ) {
            return $this->error( __( 'Cannot save the request', 'yay-wholesale-b2b' ) );
        }
        return $this->success( true, __( 'Request has been updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Delete a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id     = (int) $request->get_param( 'request_id' );
        $result = RequestsHelper::delete_whs_request( $id );

        if ( ! $result ) {
            return $this->error( __( 'Cannot delete the request', 'yay-wholesale-b2b' ) );
        }
        return $this->success( true, __( 'Request has been deleted successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Approve a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function approve_request_status_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id        = (int) $request->get_param( 'request_id' );
        $json_data = $this->get_json_params( $request );

        $role_slug    = '';
        $roles        = get_option( 'yaywholesaleb2b_roles', [] );
        $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );

        if ( ! array_key_exists( 'role_id', $json_data ) || $json_data['role_id'] < 0 ) {
            $settings  = SettingsHelper::get_settings();
            $role_slug = $settings['general']['default_role'];
            if ( empty( $role_slug ) ) {
                return $this->error( __( 'Cannot find the default role', 'yay-wholesale-b2b' ) );
            }

            $role = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                return $this->error( __( 'The default role is inactive, please set the default active or change the default role to continue', 'yay-wholesale-b2b' ) );
            }
        } else {
            $role = array_values( array_filter( $active_roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $json_data['role_id'] ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                return $this->error( __( 'Cannot find the specified role', 'yay-wholesale-b2b' ) );
            }
            $role_slug = $role['slug'];
        }

        try {
            RequestsHelper::handle_ywhs_request_author( $id, $role_slug );
        } catch ( Exception $e ) {
            return $this->error( $e->getMessage() );
        }

        if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => RequestsHelper::APPROVED ] ) ) {
            return $this->error( __( 'Role has been added to the request author, but cannot change the status', 'yay-wholesale-b2b' ) );
        }

        // Trigger the email when a wholesale account is approved.
        do_action( 'ywhs_account_registration_approved', $id );

        return $this->success( true, __( 'Request status has been updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Reject a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function reject_request_status_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id        = (int) $request->get_param( 'request_id' );
        $json_data = $this->get_json_params( $request );

        if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => RequestsHelper::REJECTED ] ) ) {
            return $this->error( __( 'Role has been removed from the request author, but cannot change the status', 'yay-wholesale-b2b' ) );
        }

        // Trigger the email when a wholesale account is rejected.
        do_action( 'ywhs_account_registration_rejected', $id );

        return $this->success( true, __( 'Request status has been updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Bulk approve of multiple wholesale requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_approve_request_status( WP_REST_Request $request ): WP_REST_Response {
        $params           = $this->get_json_params( $request );
        $ids              = $params['ids'] ?? [];
        $status           = RequestsHelper::APPROVED;
        $role_id          = $params['role_id'] ?? null;
        $updated          = 0;
        $failed_partially = 0;
        $failed_totally   = 0;

        $role_slug    = '';
        $roles        = get_option( 'yaywholesaleb2b_roles', [] );
        $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );

        if ( ! isset( $role_id ) || $role_id < 0 ) {
            $settings  = SettingsHelper::get_settings();
            $role_slug = $settings['general']['default_role'];
            if ( empty( $role_slug ) ) {
                return $this->error( __( 'Cannot find the default role', 'yay-wholesale-b2b' ) );
            }

            $role = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                return $this->error( __( 'The default role is inactive, please set the default active or change the default role to continue', 'yay-wholesale-b2b' ) );
            }
        } else {
            $role = array_values( array_filter( $active_roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $role_id ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                return $this->error( __( 'Cannot find the specified role', 'yay-wholesale-b2b' ) );
            }
            $role_slug = $role['slug'];
        }

        foreach ( $ids as $id ) {
            try {
                RequestsHelper::handle_ywhs_request_author( $id, $role_slug );
            } catch ( Exception $e ) {
                ++$failed_totally;
                continue;
            }

            if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $status ] ) ) {
                ++$failed_partially;
            } else {
                ++$updated;
                do_action( 'ywhs_account_registration_approved', $id );
            }
        }

        if ( count( $ids ) === $failed_partially || count( $ids ) === $failed_totally ) {
            return $this->error( __( 'Can not update these requests', 'yay-wholesale-b2b' ) );
        }

        if ( count( $ids ) === $updated ) {
            return $this->success( true, __( 'Requests status have been updated successfully', 'yay-wholesale-b2b' ) );
        }

        // Translators: 1: number of requests successfully updated; 2: number of requests that have add/remove role; 3: number of requests that failed.
        $message = __( '%1$d request(s) updated, %2$d request(s) changed role but failed updated status, %3$d request(s) failed', 'yay-wholesale-b2b' );
        $message = sprintf( $message, $updated, $failed_partially, $failed_totally );

        return $this->success( true, $message );
    }

    /**
     * Bulk reject multiple wholesale requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_reject_request_status( WP_REST_Request $request ): WP_REST_Response {
        $params         = $this->get_json_params( $request );
        $ids            = $params['ids'] ?? [];
        $status         = RequestsHelper::REJECTED;
        $updated        = 0;
        $failed_totally = 0;

        foreach ( $ids as $id ) {
            if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $status ] ) ) {
                ++$failed_totally;
            } else {
                ++$updated;
                do_action( 'ywhs_account_registration_rejected', $id );
            }
        }

        if ( count( $ids ) === $failed_totally ) {
            return $this->error( __( 'Can not update these requests', 'yay-wholesale-b2b' ) );
        }

        if ( count( $ids ) === $updated ) {
            return $this->success( true, __( 'Requests status have been updated successfully', 'yay-wholesale-b2b' ) );
        }

        // Translators: 1: number of requests successfully updated; 2: number of requests that have failed.
        $message = __( '%1$d request(s) updated, %2$d request(s) failed', 'yay-wholesale-b2b' );
        $message = sprintf( $message, $updated, $failed_totally );

        return $this->success( true, $message );
    }

    /**
     * Bulk delete multiple wholesale requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_delete_request( WP_REST_Request $request ): WP_REST_Response {
        $params  = $this->get_json_params( $request );
        $ids     = $params['ids'] ?? [];
        $deleted = 0;
        $failed  = 0;

        foreach ( $ids as $id ) {
            $result = RequestsHelper::delete_whs_request( $id );
            if ( $result ) {
                ++$deleted;
            } else {
                ++$failed;
            }
        }

        if ( count( $ids ) === $failed ) {
            return $this->error( __( 'Can not delete these requests', 'yay-wholesale-b2b' ) );
        }

        if ( count( $ids ) === $deleted ) {
            return $this->success( true, __( 'Requests have been deleted successfully', 'yay-wholesale-b2b' ) );
        }

        // Translators: 1: number of requests successfully deleted; 2: number of requests that failed.
        $message = __( '%1$d request(s) deleted, %2$d request(s) failed', 'yay-wholesale-b2b' );
        $message = sprintf( $message, $deleted, $failed );

        return $this->success( true, $message );
    }

    /**
     * Get the count of pending requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_pending_count( WP_REST_Request $request ): WP_REST_Response {
        $count = RequestsHelper::count_pending_requests();

        return $this->success( [ 'count' => $count ], __( 'Pending Requests are successfully counted', 'yay-wholesale-b2b' ) );
    }

    /**
     * Get the count of requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_total_count( WP_REST_Request $request ): WP_REST_Response {
        $count = RequestsHelper::count_total_requests();

        return $this->success( [ 'count' => $count ], __( 'Requests are successfully counted', 'yay-wholesale-b2b' ) );
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

    /**
     * Check if the user has the necessary permissions to access the requests endpoints (actions: get, search, delete).
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_manage_request() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Check if the user has the necessary permissions to access the requests endpoints (actions: update status, bulk update).
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_manage_request_and_user_role() {
        if ( ! ( current_user_can( 'edit_posts' ) &&
            current_user_can( 'create_users' ) &&
            current_user_can( 'promote_users' ) &&
            current_user_can( 'manage_woocommerce' ) ) ) {

            return new WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Check if the user can submit a wholesale request
     *
     * @param \WP_REST_Request $request the request receivced.
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_submit_request( WP_REST_Request $request ) {
        if ( is_user_logged_in() ) {
            $params = $this->get_form_data( $request );
            global $current_user;

            if ( in_array( 'email_address', $params, true ) ) {
                if ( $params['email_address'] !== $current_user->user_email ) {
                    return new WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
                }
            }
        }

        if ( ! isset( $_COOKIE['yaywholesaleb2b_cid'] ) || empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'Cookie Error.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        if ( ! $this->check_submit_request_limit_rate() ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'You reached the limit requests you can send. Please try again in few minutes.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }
}
