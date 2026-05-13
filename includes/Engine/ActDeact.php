<?php
namespace YayWholesaleB2B\Engine;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

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

    public static function activate() {

        if ( ! function_exists( 'WC' ) ) {
            return;
        }

        // TODO: if activate network
        // TODO: add_input_name_for_fields

        $setting         = SettingsHelper::get_settings();
        $wholesale_roles = RolesHelper::get_wholesale_roles();
        $role_slugs      = array_column( $wholesale_roles, 'slug' );

        if ( count( $role_slugs ) === 0 ) {
            $default_slug                       = RolesHelper::generate_default_role();
            $setting['general']['default_role'] = $default_slug;
            update_option( 'yaywholesaleb2b_settings', $setting );
        } elseif ( empty( $setting['general']['default_role'] ) ) {
            $setting['general']['default_role'] = $role_slugs[0];
            update_option( 'yaywholesaleb2b_settings', $setting );
        }//end if
    }

    public static function deactivate() {

        if ( ! function_exists( 'WC' ) ) {
            return;
        }
    }
}
