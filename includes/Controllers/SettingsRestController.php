<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Helpers\SettingsHelper;

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
            self::REST_NAMESPACE,
            '/settings',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'manage_settings' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/mark-reviewed',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'mark_reviewed' ],
                'permission_callback' => [ $this, 'can_manage_settings' ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/emails/update-status',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_email_status' ],
                'permission_callback' => [ $this, 'can_manage_settings' ],
            ]
        );
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
            return $this->error( __( 'Invalid settings data', 'yay-wholesale-b2b' ) );
        }

        SettingsHelper::update_settings( $params );
        $settings = SettingsHelper::get_settings();

        return $this->success( $settings, __( 'Settings saved!', 'yay-wholesale-b2b' ) );
    }

    /**
     * Mark the plugin as reviewed.
     *
     * @return WP_REST_Response The response object.
     */
    public function mark_reviewed(): WP_REST_Response {
        update_option( 'yaywholesaleb2b_reviewed', true );
        return $this->success();
    }

    public function get_email_settings_by_id( string $email_id ): array {
        $emails = WC()->mailer()->get_emails();
        foreach ( $emails as $email ) {
            if ( $email->id === $email_id ) {
                return $email->settings;
            }
        }
        return [];
    }

    /**
     * Update the status of an email.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_email_status( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );

        $email_id = isset( $params['emailId'] ) ? sanitize_text_field( $params['emailId'] ) : '';
        $status   = isset( $params['status'] ) ? filter_var( $params['status'], FILTER_VALIDATE_BOOLEAN ) : false;

        if ( empty( $email_id ) || ! is_bool( $status ) ) {
            return $this->error( __( 'Invalid parameters', 'yay-wholesale-b2b' ) );
        }

        // Compose the option key used by WooCommerce for single-email settings
        $option_key = sprintf( 'woocommerce_%s_settings', $email_id );

        // Retrieve existing option. Use get_option with default array to avoid falsey returns.
        $settings = get_option( $option_key, [] );

        if ( ! $settings ) {
            // get settings by email id
            $settings = $this->get_email_settings_by_id( $email_id );

            if ( empty( $settings ) ) {
                return $this->error( __( 'Email settings not found for this email ID', 'yay-wholesale-b2b' ), 404 );
            }
        }

        // Ensure settings is an array (when stored as serialized array or object)
        if ( ! is_array( $settings ) ) {
            // If it's an object (rare), cast to array
            if ( is_object( $settings ) ) {
                $settings = (array) $settings;
            } else {
                // Can't safely operate on non-array settings
                return $this->error( __( 'Stored email settings are in an unsupported format.', 'yay-wholesale-b2b' ) );
            }
        }

        // Update the enabled key
        $settings['enabled'] = $status ? 'yes' : 'no';
        update_option( $option_key, $settings, 'yes' );

        return $this->success( [], __( 'Email status updated!', 'yay-wholesale-b2b' ) );
    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_manage_settings() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }
}
