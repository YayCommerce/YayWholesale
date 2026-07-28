<?php
namespace YayWholesaleB2B\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use YayWholesaleB2B\Engine\Compatibles\Barn2WoocommerceProductTable\Barn2WoocommerceProductTable;
use YayWholesaleB2B\Engine\Compatibles\EUVATForWoocommerce;
use YayWholesaleB2B\Engine\Compatibles\YayCurrency;
use YayWholesaleB2B\Engine\Compatibles\YayExtra;
use YayWholesaleB2B\Engine\Compatibles\YayMail;
use YayWholesaleB2B\Utils\SingletonTrait;

/**
 * Compatibles
 */
class Compatibles {
    use SingletonTrait;

    protected function __construct() {
        YayCurrency::get_instance();
        YayExtra::get_instance();
        YayMail::get_instance();
        Barn2WoocommerceProductTable::get_instance();
        EUVATForWoocommerce::get_instance();
    }
}
