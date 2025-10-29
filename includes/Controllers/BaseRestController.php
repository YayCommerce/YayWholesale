<?php
namespace Yay_Wholesale\Controllers;

use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Class BaseRestController
 *
 * Provides common methods for REST controllers.
 */
abstract class BaseRestController {

    protected string $namespace = 'yay-wholesale/v1';
    protected string $rest_base = '';

    protected function success( array $data = [], string $message = '' ): WP_REST_Response {
        return rest_ensure_response(
            array_filter(
                [
                    'success' => true,
                    'message' => $message,
                    'data'    => $data,
                ]
            )
        );
    }

    protected function error( string $message, int $status = 400 ): WP_REST_Response {
        return rest_ensure_response(
            [
                'success' => false,
                'message' => $message,
            ],
            $status
        );
    }

    protected function get_json_params( WP_REST_Request $request ): array {
        return (array) $request->get_json_params();
    }
}
