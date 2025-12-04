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

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/settings',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'manage_settings' ],
                    'permission_callback' => [ $this, 'settings_permission_callback' ],
                ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/mark-reviewed',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'mark_reviewed' ],
                'permission_callback' => [ $this, 'settings_permission_callback' ],
            ]
        );
    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function settings_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Manage the settings.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function manage_settings( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );

        if ( empty( $params ) ) {
            return $this->error( __( 'Invalid settings data', 'yay-wholesale' ) );
        }

        update_option( 'yay_wholesale_settings', $params );

        return $this->success( [], __( 'Settings saved!', 'yay-wholesale' ) );
    }

    /**
     * Mark the plugin as reviewed.
     *
     * @return WP_REST_Response The response object.
     */
    public function mark_reviewed(): WP_REST_Response {
        update_option( 'yay_wholesale_reviewed', true );
        return $this->success();
    }
}
