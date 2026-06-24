<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\SetupWizardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Setup wizard API endpoints.
 */
class SetupWizardRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/setup-wizard',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'setup_settings' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/setup-wizard/skip',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'mark_completed_wizard' ],
                    'permission_callback' => [ $this, 'can_manage_settings' ],
                ],
            ]
        );
    }

    public function mark_completed_wizard( WP_REST_Request $request ) {
        SetupWizardHelper::mark_setup_wizard_completed();
        return true;
    }

    public function setup_settings( WP_REST_Request $request ) {
        $payload = $request->get_json_params();
        $setting = SettingsHelper::get_settings();
        $roles   = RolesHelper::get_wholesale_roles();

        // Update default role
        $default_role_setting = $payload['defaultRole'];
        if ( ! empty( $default_role_setting ) ) {
            $roles = array_map(
                function( $role ) use ( $setting, $default_role_setting ) {
                    if ( isset( $role['slug'] ) &&
                    $role['slug'] === $setting['general']['default_role'] ) {
                        $role = array_merge( $role, $default_role_setting );
                    }
                    return $role;
                },
                $roles
            );

            RolesHelper::save_wholesale_roles( $roles );
        }

        // Update Setting Registration
        $registration_setting = $payload['registration'];
        if ( ! empty( $registration_setting ) ) {
            $setting['registration'] = array_merge( $setting['registration'], $registration_setting );
        }

        SettingsHelper::update_settings( $setting );

        SetupWizardHelper::mark_setup_wizard_completed();

        return [
            'roles'    => RolesHelper::get_wholesale_roles(),
            'settings' => SettingsHelper::get_full_settings(),
        ];
    }

    public function can_manage_settings() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
