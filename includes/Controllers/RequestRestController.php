<?php
namespace Yay_Wholesale\Controllers;

use WP_Error;
use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale\Helpers\RequestsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Requests API endpoints.
 */
class RequestRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

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
    }

    public function register_request( WP_REST_Request $request ): WP_REST_Response {
        $params       = $this->get_form_data( $request );
        $current_user = get_current_user_id();

        RequestsHelper::insert_whs_request( $current_user, $params );

        return $this->success( [], __( 'Request Saved', 'yay-wholesale' ) );
    }

    public function get_request_list( WP_REST_Request $request ): WP_REST_Response {
        $page     = $request['page'];
        $per_page = $request['per_page'];
        $keyword  = $request['kw'];

        if ( ! isset( $page ) ) {
            $page = 1;
        }

        if ( ! isset( $per_page ) ) {
            $per_page = 10;
        }

        if ( ! isset( $keyword ) ) {
            $keyword = '';
        }

        $response = RequestsHelper::get_paginated_request_post( $keyword, $page, $per_page );

        return $this->success( $response, __( 'Fetched successfully', 'yay-wholesale' ) );
    }

    public function get_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id      = (int) $request->get_param( 'request_id' );
        $request = RequestsHelper::get_request_by_id( $id );

        if ( empty( $request ) ) {
            return $this->error( __( 'Request not found', 'yay-wholesale' ), 404 );
        }

        return $this->success( $request );
    }

    public function update_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id        = (int) $request->get_param( 'request_id' );
        $form_data = $this->get_json_params( $request );

        $result = RequestsHelper::update_whs_request( $id, $form_data );
        if ( ! $result ) {
            return $this->error( __( 'Cannot save the request', 'yay-wholesale' ), 404 );
        }
        return $this->success( [], __( 'Request has been updated successfully', 'yay-wholesale' ) );
    }

    public function delete_request_by_id( WP_REST_Request $request ): WP_REST_Response {
        $id     = (int) $request->get_param( 'request_id' );
        $result = RequestsHelper::delete_whs_request( $id );

        if ( ! $result ) {
            return $this->error( __( 'Cannot delete the request', 'yay-wholesale' ), 404 );
        }
        return $this->success( [], __( 'Request has been deleted successfully', 'yay-wholesale' ) );
    }
}
