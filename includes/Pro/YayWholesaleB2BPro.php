<?php
namespace YayWholesaleB2B\Pro;

use YayWholesaleB2B\Pro\Engine\Admin\CategoryBasedPricing;
use YayWholesaleB2B\Pro\Engine\Admin\ProductBasedPricing;
use YayWholesaleB2B\Pro\Engine\Frontend\PaymentGateway;
use YayWholesaleB2B\Pro\Engine\Frontend\Pricing;
use YayWholesaleB2B\Pro\Engine\Frontend\Requirement;
use YayWholesaleB2B\Pro\Engine\Frontend\ShippingMethod;
use YayWholesaleB2B\Pro\YayWholesaleB2BProLicenseAdapter;
use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Pro Features Initalize
 */
class YayWholesaleB2BPro {
    use SingletonTrait;

    protected function __construct() {
        \YayWholesaleB2BScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayWholesaleB2BProLicenseAdapter()
        );

        if ( ! YayWholesaleB2BProLicenseAdapter::is_licensed() ) {
            return;
        }

        // Frontend
        PaymentGateway::get_instance();
        ShippingMethod::get_instance();
        Requirement::get_instance();
        Pricing::get_instance();

        // Admin
        ProductBasedPricing::get_instance();
        CategoryBasedPricing::get_instance();
    }

    public static function initialize() {
        self::get_instance();
    }
}
