<?php
namespace YayWholesaleB2B\Engine;

use YayWholesaleB2B\Helpers\MigrationHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\SetupWizardHelper;

/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {

    public static function install_yaywholesaleb2b_admin_notice() {
        /* translators: %s: Woocommerce link */
        echo '<div class="error"><p><strong>' . sprintf( esc_html__( 'YayWholesale is enabled but not effective. It requires %s in order to work', 'yay-wholesale-b2b' ), '<a href="' . esc_url( admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' ) ) . '">WooCommerce</a>' ) . '</strong></p></div>';
        return false;
    }

    public static function before_woocommerce_init() {
        if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', YAYWHOLESALEB2B_FILE, true );
        }
    }

    public static function activate( bool $network_wide ) {

        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        if ( function_exists( 'is_multisite' ) && is_multisite() ) {
            if ( $network_wide ) {
                // Get all blog ids
                /** @var array<\WP_Site> $blogs */
                $blogs = get_sites();

                foreach ( $blogs as $blog ) {
                    switch_to_blog( (int) $blog->blog_id );
                    self::single_activate();
                    restore_current_blog();
                }

                return;
            }
        }

        self::single_activate();
    }

    public static function deactivate() {

        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        if ( class_exists( 'YayWholesaleB2B\Pro\YayWholesaleB2BPro', true ) ) {
            \YayWholesaleB2B\Pro\YayWholesaleB2BPro::deactivate();
        }
    }

    protected static function single_activate() {
        MigrationHelper::migrate_data();

        $setting         = SettingsHelper::get_settings();
        $wholesale_roles = RolesHelper::get_wholesale_roles();

        if ( count( $wholesale_roles ) === 0 ) {
            $default_slug = RolesHelper::generate_default_role();
            SetupWizardHelper::save_setup_wizard_status( 'fresh' );
            $setting['general']['default_role'] = $default_slug;
            SettingsHelper::update_settings( $setting );
        } elseif ( empty( $setting['general']['default_role'] ) ) {
            $active_roles = RolesHelper::get_active_wholesale_roles();
            if ( empty( $active_roles ) ) {
                $default_slug = array_first( $wholesale_roles )['slug'];
            } else {
                $default_slug = array_first( $active_roles )['slug'];
            }
            $setting['general']['default_role'] = $default_slug;
            SettingsHelper::update_settings( $setting );
        }

        if ( 'fresh' === SetupWizardHelper::get_setup_wizard_status() ) {
            SetupWizardHelper::init_setup_wizard();
        }

        if ( class_exists( 'YayWholesaleB2B\Pro\YayWholesaleB2BPro', true ) ) {
            \YayWholesaleB2B\Pro\YayWholesaleB2BPro::activate();
        }
    }
}
