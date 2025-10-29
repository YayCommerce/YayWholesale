<?php
namespace Yay_Wholesale\Controllers;

use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Settings API endpoints.
 */
class SettingsRestController extends BaseRestController {
    use SingletonTrait;

    protected string $rest_base = 'settings';

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
                    'callback'            => [ $this, 'manage_settings' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/mark-reviewed',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'mark_reviewed' ],
                'permission_callback' => '__return_true',
            ]
        );
    }

    public function manage_settings( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );

        if ( empty( $params ) ) {
            return $this->error( __( 'Invalid settings data', 'yay-wholesale' ) );
        }

        update_option( 'yay_wholesale_settings', $params );

        return $this->success( [], __( 'Settings saved!', 'yay-wholesale' ) );
    }

    public function mark_reviewed(): WP_REST_Response {
        update_option( 'yay_wholesale_reviewed', true );
        return $this->success();
    }
}
