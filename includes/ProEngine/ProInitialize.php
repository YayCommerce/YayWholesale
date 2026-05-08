<?php
namespace YayWholesaleB2B\ProEngine;

use YayWholesaleB2B\ProEngine\Frontend\PaymentGateway;
use YayWholesaleB2B\ProEngine\Frontend\Requirement;
use YayWholesaleB2B\ProEngine\Frontend\ShippingMethod;
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
        PaymentGateway::get_instance();
        ShippingMethod::get_instance();
        Requirement::get_instance();
    }
}
