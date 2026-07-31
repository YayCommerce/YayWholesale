<?php
/**
 * Plugin Name:       Yay Wholesale B2B for WooCommerce
 * Plugin URI:        https://yaycommerce.com/
 * Description:       WooCommerce wholesale plugin for serving wholesale & B2B customers.
 * Version:           1.2.rc.4
 * Author:            YayCommerce
 * Author URI:        https://yaycommerce.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       yay-wholesale-b2b
 * Domain Path:       /languages
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * WC requires at least: 10.0.0
 * WC tested up to: 10.7.0
 *
 * @package yaycommerce/yay-wholesale
 */

namespace YayWholesaleB2B;

defined( 'ABSPATH' ) || exit;

if ( function_exists( 'YayWholesaleB2B\\plugin_init' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'includes/Fallback.php';
    add_action(
        'admin_init',
        function () {
            deactivate_plugins( plugin_basename( __FILE__ ) );
        }
    );
}

if ( ! defined( 'YAYWHOLESALEB2B_FILE' ) ) {
    define( 'YAYWHOLESALEB2B_FILE', __FILE__ );
}

if ( ! defined( 'YAYWHOLESALEB2B_VERSION' ) ) {
    define( 'YAYWHOLESALEB2B_VERSION', '1.2.rc.4' );
}

if ( ! defined( 'YAYWHOLESALEB2B_PLUGIN_URL' ) ) {
    define( 'YAYWHOLESALEB2B_PLUGIN_URL', plugin_dir_url( YAYWHOLESALEB2B_FILE ) );
}

if ( ! defined( 'YAYWHOLESALEB2B_PLUGIN_DIR' ) ) {
    define( 'YAYWHOLESALEB2B_PLUGIN_DIR', plugin_dir_path( YAYWHOLESALEB2B_FILE ) );
}

if ( ! defined( 'YAYWHOLESALEB2B_BASE_NAME' ) ) {
    define( 'YAYWHOLESALEB2B_BASE_NAME', plugin_basename( YAYWHOLESALEB2B_FILE ) );
}

if ( ! defined( 'YAYWHOLESALEB2B_MENU_ORDER' ) ) {
    define( 'YAYWHOLESALEB2B_MENU_ORDER', 2 );
}
if ( ! defined( 'YAYWHOLESALEB2B_MENU_PRIORITY' ) ) {
    define( 'YAYWHOLESALEB2B_MENU_PRIORITY', 90 );
}

spl_autoload_register(
    function ( $class ) {
        $prefix = __NAMESPACE__;
        // project-specific namespace prefix
        $base_dir = __DIR__ . '/includes';
        // base directory for the namespace prefix

        $len = strlen( $prefix );
        if ( strncmp( $prefix, $class, $len ) !== 0 ) {
            // does the class use the namespace prefix?
            return;
            // no, move to the next registered autoloader
        }

        $relative_class_name = substr( $class, $len );

        // replace the namespace prefix with the base directory, replace namespace
        // separators with directory separators in the relative class name, append
        // with .php
        $file = $base_dir . str_replace( '\\', '/', $relative_class_name ) . '.php';

        if ( file_exists( $file ) ) {
            require $file;
        }
    }
);

if ( ! function_exists( 'YayWholesaleB2B\\plugin_init' ) ) {
    function plugin_init() {
        require_once __DIR__ . '/vendor/autoload.php';
        \YayWholesaleB2BScoped\YayCommerce\AdminShell\AdminShell::boot();

        if ( ! function_exists( 'WC' ) ) {
            add_action( 'admin_notices', [ \YayWholesaleB2B\Engine\ActDeact::class, 'install_yaywholesaleb2b_admin_notice' ] );
            return;
        }

        add_action( 'before_woocommerce_init', [ \YayWholesaleB2B\Engine\ActDeact::class, 'before_woocommerce_init' ] );

        YayWholesaleB2B::initialize();
        I18n::load_plugin_textdomain();
    }
}//end if

if ( ! wp_installing() ) {
    add_action( 'plugins_loaded', 'YayWholesaleB2B\\plugin_init' );
}

register_activation_hook( YAYWHOLESALEB2B_FILE, [ \YayWholesaleB2B\Engine\ActDeact::class, 'activate' ] );
register_deactivation_hook( YAYWHOLESALEB2B_FILE, [ \YayWholesaleB2B\Engine\ActDeact::class, 'deactivate' ] );
