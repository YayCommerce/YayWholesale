<?php
namespace YayWholesaleB2B\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

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
    }

    public function remove_price_related_hooks() {
        remove_filter( 'ywhs_price_handle_processed', [ YayCurrency::get_instance(), 'convert_currency_price' ], 10, 1 );
    }

    public function add_price_related_hooks() {
        add_filter( 'ywhs_price_handle_processed', [ YayCurrency::get_instance(), 'convert_currency_price' ], 10, 1 );
    }
}
