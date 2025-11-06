<?php
namespace Yay_Wholesale\Controllers;

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

    protected string $rest_base = 'requests';

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'regist_request' ],
                    'permission_callback' => '__return_true',
                ],
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_request_list' ],
                    'permission_Callback' => '__return_true',
                ],
            ]
        );
    }

    public function regist_request( WP_REST_Request $request ): WP_REST_Response {
        $params  = $this->get_form_data( $request );
        $current = get_current_user_id();

        RequestsHelper::insert_whs_request( $current, $params );

        return $this->success( [], __( 'Request Saved', 'yay-wholesale' ) );
    }

    public function get_request_list( WP_REST_Request $request ): WP_REST_Response {
        $page     = $request['page'];
        $per_page = $request['per_page'];
        $filter   = $request['kw'];

        if ( ! isset( $page ) ) {
            $page = 1;
        }

        if ( ! isset( $per_page ) ) {
            $per_page = 10;
        }

        if ( ! isset( $filter ) ) {
            $filter = '';
        }

        $response = RequestsHelper::get_paginated_request_post( $filter, $page, $per_page );

        return $this->success( $response, __( 'Fetched successfully', 'yay-wholesale' ) );
    }
}
