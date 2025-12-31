<?php
namespace Yay_Wholesale\Controllers;

use Exception;
use WP_Error;
use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale\Helpers\RequestsHelper;
use Yay_Wholesale\Helpers\SettingsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Requests API endpoints.
 */
class RequestRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    /**
     * Check if the user has the necessary permissions to access the requests endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function request_permission_callback() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
        }

        return true;
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/requests',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'register_request' ],
                    'permission_callback' => '__return_true',
                ],
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_request_list' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/requests/(?P<request_id>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_request_by_id' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_request_by_id' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_request_by_id' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/requests/(?P<request_id>\d+)/status',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_request_status_by_id' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/requests/bulk-status',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_update_request_status' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/requests/bulk-delete',
            [
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'bulk_delete_request' ],
                    'permission_callback' => [ $this,'request_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/requests/pending',
            [
                [
                    'methods'  => 'GET',
                    'callback' => [ $this, 'get_pending_count' ],
                    // 'permission_callback' => [ $this,'request_permission_callback' ],
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
        $params       = $this->get_form_data( $request );
        $current_user = get_current_user_id();

        $wholesale_id = RequestsHelper::insert_whs_request( $current_user, $params );

        if ( $wholesale_id < 0 ) {
            return $this->error( __( 'Failed to register this request', 'yay-wholesale' ) );
        }

        $settings = SettingsHelper::get_settings();
        if ( ! $settings['registration']['moderate'] ) {
            $roles        = get_option( 'yay_wholesale_roles', [] );
            $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );
            $role_slug    = $settings['general']['default_role'];
            $role         = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
            if ( ! isset( $role ) ) {
                do_action( 'yhs_account_registration_pending', $wholesale_id );
                return $this->error( __( 'The default role is inactive, your request is changed to pending', 'yay-wholesale' ), 404 );
            }

            try {
                RequestsHelper::add_role_to_ywhs_request_author( $wholesale_id, $role_slug );
            } catch ( Exception $e ) {
                do_action( 'yhs_account_registration_pending', $wholesale_id );
                return $this->error( $e->getMessage(), 404 );
            }

            if ( ! RequestsHelper::update_whs_request( $wholesale_id, [ 'status' => RequestsHelper::APPROVED ] ) ) {
                do_action( 'yhs_account_registration_pending', $wholesale_id );
                return $this->error( __( 'Role has been applied, but your request is still pending', 'yay-wholesale' ), 404 );
            }

            // Trigger the email when a new wholesale account is approved.
            do_action( 'yhs_account_registration_approved', $wholesale_id );
        } else {
            // Trigger the email when a new wholesale account is pending.
            do_action( 'yhs_account_registration_pending', $wholesale_id );
        }//end if

        return $this->success( [], __( 'Request Saved', 'yay-wholesale' ) );
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

        return $this->success( $response, __( 'Fetched successfully', 'yay-wholesale' ) );
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
            return $this->error( __( 'Request not found', 'yay-wholesale' ), 404 );
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
            return $this->error( __( 'Cannot save the request', 'yay-wholesale' ), 404 );
        }
        return $this->success( [], __( 'Request has been updated successfully', 'yay-wholesale' ) );
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
            return $this->error( __( 'Cannot delete the request', 'yay-wholesale' ), 404 );
        }
        return $this->success( [], __( 'Request has been deleted successfully', 'yay-wholesale' ) );
    }

    /**
     * Update the status of a wholesale request by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_request_status_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id        = (int) $request->get_param( 'request_id' );
        $json_data = $this->get_json_params( $request );

        if ( RequestsHelper::APPROVED === $json_data['status'] ) {
            $role_slug    = '';
            $roles        = get_option( 'yay_wholesale_roles', [] );
            $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );

            if ( ! array_key_exists( 'role_id', $json_data ) || $json_data['role_id'] < 0 ) {
                $settings  = SettingsHelper::get_settings();
                $role_slug = $settings['general']['default_role'];
                if ( empty( $role_slug ) ) {
                    return $this->error( __( 'Cannot find the default role', 'yay-wholesale' ), 404 );
                }

                $role = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
                if ( ! isset( $role ) ) {
                    return $this->error( __( 'The default role is inactive, please set the default active or change the default role to continue', 'yay-wholesale' ), 404 );
                }
            } else {
                $role = array_values( array_filter( $active_roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $json_data['role_id'] ) )[0] ?? null;
                if ( ! isset( $role ) ) {
                    return $this->error( __( 'Cannot find the specified role', 'yay-wholesale' ), 404 );
                }
                $role_slug = $role['slug'];
            }

            try {
                RequestsHelper::add_role_to_ywhs_request_author( $id, $role_slug );
            } catch ( Exception $e ) {
                return $this->error( $e->getMessage(), 404 );
            }

            if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $json_data['status'] ] ) ) {
                return $this->error( __( 'Role has been added to the request author, but cannot change the status', 'yay-wholesale' ), 404 );
            }

            // Trigger the email when a wholesale account is approved.
            do_action( 'yhs_account_registration_approved', $id );

        } elseif ( RequestsHelper::REJECTED === $json_data['status'] ) {
            RequestsHelper::remove_role_from_ywhs_request_author( $id );

            if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $json_data['status'] ] ) ) {
                return $this->error( __( 'Role has been removed from the request author, but cannot change the status', 'yay-wholesale' ), 404 );
            }

            // Trigger the email when a wholesale account is rejected.
            do_action( 'yhs_account_registration_rejected', $id );

        } else {
            return $this->error( __( 'You just can approve/reject this request', 'yay-wholesale' ), 404 );
        }//end if

        return $this->success( [], __( 'Request status has been updated successfully', 'yay-wholesale' ) );
    }

    /**
     * Bulk update the status of multiple wholesale requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_update_request_status( WP_REST_Request $request ): WP_REST_Response {
        $params           = $this->get_json_params( $request );
        $ids              = $params['ids'] ?? [];
        $status           = $params['status'] ?? null;
        $role_id          = $params['role_id'] ?? null;
        $updated          = 0;
        $failed_partially = 0;
        $failed_totally   = 0;

        if ( RequestsHelper::APPROVED === $status ) {
            $role_slug    = '';
            $roles        = get_option( 'yay_wholesale_roles', [] );
            $active_roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] ) );

            if ( ! isset( $role_id ) || $role_id < 0 ) {
                $settings  = SettingsHelper::get_settings();
                $role_slug = $settings['general']['default_role'];
                if ( empty( $role_slug ) ) {
                    return $this->error( __( 'Cannot find the default role', 'yay-wholesale' ), 404 );
                }

                $role = array_values( array_filter( $active_roles, fn( $r ) => $r['slug'] === $role_slug ) )[0] ?? null;
                if ( ! isset( $role ) ) {
                    return $this->error( __( 'The default role is inactive, please set the default active or change the default role to continue', 'yay-wholesale' ), 404 );
                }
            } else {
                $role = array_values( array_filter( $active_roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $role_id ) )[0] ?? null;
                if ( ! isset( $role ) ) {
                    return $this->error( __( 'Cannot find the specified role', 'yay-wholesale' ), 404 );
                }
                $role_slug = $role['slug'];
            }

            foreach ( $ids as $id ) {
                try {
                    RequestsHelper::add_role_to_ywhs_request_author( $id, $role_slug );
                } catch ( Exception $e ) {
                    ++$failed_totally;
                    continue;
                }

                if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $status ] ) ) {
                    ++$failed_partially;
                } else {
                    ++$updated;
                }
            }
        } elseif ( RequestsHelper::REJECTED === $status ) {
            foreach ( $ids as $id ) {
                try {
                    RequestsHelper::remove_role_from_ywhs_request_author( $id );
                } catch ( Exception $e ) {
                    ++$failed_totally;
                    continue;
                }

                if ( ! RequestsHelper::update_whs_request( $id, [ 'status' => $status ] ) ) {
                    ++$failed_partially;
                } else {
                    ++$updated;
                }
            }
        } else {
            return $this->error( __( 'You just can approve/reject requests', 'yay-wholesale' ), 404 );
        }//end if

        if ( count( $ids ) === $failed_partially || count( $ids ) === $failed_totally ) {
            return $this->error( __( 'Can not update these requests', 'yay-wholesale' ), 404 );
        }

        if ( count( $ids ) === $updated ) {
            return $this->success( [], __( 'Requests status have been updated successfully', 'yay-wholesale' ) );
        }

        // Translators: 1: number of requests successfully updated; 2: number of requests that have add/remove role; 3: number of requests that failed.
        $message = __( '%1$d request(s) updated, %2$d request(s) changed role but failed updated status, %3$d request(s) failed', 'yay-wholesale' );
        $message = sprintf( $message, $updated, $failed_partially, $failed_totally );

        return $this->success( [], $message );
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
            return $this->error( __( 'Can not delete these requests', 'yay-wholesale' ), 404 );
        }

        if ( count( $ids ) === $deleted ) {
            return $this->success( [], __( 'Requests have been deleted successfully', 'yay-wholesale' ) );
        }

        // Translators: 1: number of requests successfully deleted; 2: number of requests that failed.
        $message = __( '%1$d request(s) deleted, %2$d request(s) failed', 'yay-wholesale' );
        $message = sprintf( $message, $deleted, $failed );

        return $this->success( [], $message );
    }

    /**
     * Get the count of pending requests.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_pending_count( WP_REST_Request $request ): WP_REST_Response {
        $count = RequestsHelper::count_pending_requests();

        return $this->success( [ 'count' => $count ], __( 'Pending Requests are successfully counted', 'yay-wholesale' ) );
    }
}
