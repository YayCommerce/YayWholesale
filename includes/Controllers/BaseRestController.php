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

    /**
     * Return an error response.
     *
     * @param string $message The error message.
     * @param int    $status The HTTP status code.
     * @return WP_REST_Response The response object.
     */
    protected function error( string $message, int $status = 400 ): WP_REST_Response {
        return new WP_REST_Response(
            [
                'success' => false,
                'message' => $message,
            ],
            $status
        );
    }

    /**
     * Get the JSON parameters from the request.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The JSON parameters.
     */
    protected function get_json_params( WP_REST_Request $request ): array {
        return (array) $request->get_json_params();
    }

    /**
     * Get the form data from the request.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The form data.
     */
    protected function get_form_data( WP_REST_Request $request ): array {
        return (array) $request->get_body_params();
    }
}
