<?php
namespace YayWholesaleB2B\ProEngine;

use YayWholesaleB2B\ProEngine\Engine\Admin\CategoryBasedPricing;
use YayWholesaleB2B\ProEngine\Engine\Admin\ProductBasedPricing;
use YayWholesaleB2B\ProEngine\Engine\Frontend\PaymentGateway;
use YayWholesaleB2B\ProEngine\Engine\Frontend\Requirement;
use YayWholesaleB2B\ProEngine\Engine\Frontend\ShippingMethod;
use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Pro Features Initalize
 */
class ProInitialize {
    use SingletonTrait;

    protected function __construct() {
        // Frontend
        PaymentGateway::get_instance();
        ShippingMethod::get_instance();
        Requirement::get_instance();

        // Admin
        ProductBasedPricing::get_instance();
        CategoryBasedPricing::get_instance();
    }
}
