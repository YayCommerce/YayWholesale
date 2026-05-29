<?php
namespace YayWholesaleB2B\Pro;

use YayWholesaleB2B\Pro\YayWholesaleB2BProLicenseAdapter;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Pro Features Initalize
 */
class YayWholesaleB2BPro {
    use SingletonTrait;

    protected function __construct() {
        if ( ! YayWholesaleB2BProLicenseAdapter::is_licensed() ) {
            return;
        }

        \YayWholesaleB2B\Pro\Engine\Frontend\PaymentGateway::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\ShippingMethod::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\Requirement::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\Pricing::get_instance();

        \YayWholesaleB2B\Pro\Engine\Admin\ProductBasedPricing::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\CategoryBasedPricing::get_instance();

        \YayWholesaleB2B\Pro\Engine\Support\Support::get_instance();
    }

    public static function initialize() {
        self::get_instance();
    }

    public static function register_admin_menu() {
        \YayWholesaleB2BScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayWholesaleB2BProLicenseAdapter()
        );
    }
}
