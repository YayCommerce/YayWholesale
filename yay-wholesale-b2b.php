<?php
/**
 * Plugin Name:       YayWholesale Pro
 * Plugin URI:        https://yaycommerce.com/
 * Description:       WooCommerce wholesale plugin for serving wholesale & B2B customers.
 * Version:           1.0.0
 * Author:            YayCommerce
 * Author URI:        https://yaycommerce.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       yay-wholesale-b2b
 * Domain Path:       /languages
 * Requires at least: 3.0
 * Requires PHP: 7.0
 * WC requires at least: 3.0.0
 * WC tested up to: 10.2.2
 *
 * @package yaycommerce/yay-wholesale
 */

namespace Yay_Wholesale_B2B;

defined( 'ABSPATH' ) || exit;

if ( function_exists( 'Yay_Wholesale_B2B\\plugin_init' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'includes/Fallback.php';
    add_action(
        'admin_init',
        function () {
            deactivate_plugins( plugin_basename( __FILE__ ) );
        }
    );
}


if ( ! defined( 'YAY_WHOLESALE_B2B_FILE' ) ) {
    define( 'YAY_WHOLESALE_B2B_FILE', __FILE__ );
}

if ( ! defined( 'YAY_WHOLESALE_B2B_VERSION' ) ) {
    define( 'YAY_WHOLESALE_B2B_VERSION', '1.0.0' );
}

if ( ! defined( 'YAY_WHOLESALE_B2B_PLUGIN_URL' ) ) {
    define( 'YAY_WHOLESALE_B2B_PLUGIN_URL', plugin_dir_url( YAY_WHOLESALE_B2B_FILE ) );
}

if ( ! defined( 'YAY_WHOLESALE_B2B_PLUGIN_DIR' ) ) {
    define( 'YAY_WHOLESALE_B2B_PLUGIN_DIR', plugin_dir_path( YAY_WHOLESALE_B2B_FILE ) );
}

if ( ! defined( 'YAY_WHOLESALE_B2B_BASE_NAME' ) ) {
    define( 'YAY_WHOLESALE_B2B_BASE_NAME', plugin_basename( YAY_WHOLESALE_B2B_FILE ) );
}

define( 'YAY_WHOLESALE_B2B_IS_DEVELOPMENT', true );

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


if ( ! function_exists( 'Yay_Wholesale_B2B\\plugin_init' ) ) {
    function plugin_init() {

        \Yay_Wholesale_B2B\YayCommerceMenu\RegisterMenu::get_instance();
        if ( ! function_exists( 'WC' ) ) {
            add_action( 'admin_notices', [ \Yay_Wholesale_B2B\Engine\ActDeact::class, 'install_yaywholesale_admin_notice' ] );
            return;
        }

        add_action( 'before_woocommerce_init', [ \Yay_Wholesale_B2B\Engine\ActDeact::class, 'before_woocommerce_init' ] );

        Initialize::get_instance();
        I18n::load_plugin_textdomain();
    }
}

if ( ! wp_installing() ) {
    add_action( 'plugins_loaded', 'Yay_Wholesale_B2B\\plugin_init' );
}

register_activation_hook( YAY_WHOLESALE_B2B_FILE, [ \Yay_Wholesale_B2B\Engine\ActDeact::class, 'activate' ] );
register_deactivation_hook( YAY_WHOLESALE_B2B_FILE, [ \Yay_Wholesale_B2B\Engine\ActDeact::class, 'deactivate' ] );
