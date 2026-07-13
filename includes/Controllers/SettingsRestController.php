<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
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
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_settings' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'update_settings' ],
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

    public function get_settings() {
        return SettingsHelper::get_full_settings();
    }

    public function update_settings( WP_REST_Request $request ) {
        $payload = $request->get_json_params();

        if ( empty( $payload ) ) {
            return $this->error_invalid_arguments();
        }

        $settings = [
            'general'             => $payload['general'],
            'display'             => $payload['display'],
            'registration'        => $payload['registration'],
            'registration_fields' => $payload['registration_fields'],
            'promotion_rules'     => $payload['promotion_rules'],
        ];
        SettingsHelper::update_settings( $settings );
        do_action( 'ywhs_settings_updated', $payload );

        return SettingsHelper::get_full_settings();
    }

    public function mark_reviewed() {
        update_option( 'yaywholesaleb2b_reviewed', true );
        return true;
    }

    public function update_email_status( WP_REST_Request $request ) {
        $payload = $request->get_json_params();

        $email_id = isset( $payload['emailId'] ) ? sanitize_text_field( $payload['emailId'] ) : '';
        $status   = isset( $payload['status'] ) ? filter_var( $payload['status'], FILTER_VALIDATE_BOOLEAN ) : false;

        if ( empty( $email_id ) || ! is_bool( $status ) ) {
            return $this->error_invalid_arguments();
        }

        // Compose the option key used by WooCommerce for single-email settings
        $option_key = sprintf( 'woocommerce_%s_settings', $email_id );

        $mail_settings = get_option( $option_key );

        if ( $mail_settings === false ) {
            $wc_emails = WC()->mailer()->get_emails();
            foreach ( $wc_emails as $wc_email ) {
                if ( $wc_email->id === $email_id ) {
                    $mail_settings = $wc_email;
                }
            }
        } elseif ( is_object( $mail_settings ) ) {
            $mail_settings = (array) $mail_settings;
        }

        if ( empty( $mail_settings ) ) {
            return $this->error_invalid_arguments();
        }

        // Update the enabled key
        $mail_settings['enabled'] = $status ? 'yes' : 'no';
        update_option( $option_key, $mail_settings, 'yes' );

        return true;
    }

    public function can_manage_settings() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
