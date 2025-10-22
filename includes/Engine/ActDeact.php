<?php
namespace Yay_Wholesale\Engine;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\Helper;

/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {

	use SingletonTrait;

	protected function __construct() {}

	public static function install_yaywholesale_admin_notice() {
		/* translators: %s: Woocommerce link */
		echo '<div class="error"><p><strong>' . sprintf( esc_html__( 'YayWholesale is enabled but not effective. It requires %s in order to work', 'yay-wholesale' ), '<a href="' . esc_url( admin_url( 'plugin-install.php?s=woocommerce&tab=search&type=term' ) ) . '">WooCommerce</a>' ) . '</strong></p></div>';
		return false;
	}

	public static function before_woocommerce_init() {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', YAY_WHOLESALE_FILE, true );
		}
	}

	public static function activate() {

		if ( ! function_exists( 'WC' ) ) {
			return;
		}

	}

	public static function deactivate() {

		if ( ! function_exists( 'WC' ) ) {
			return;
		}

	}
}
