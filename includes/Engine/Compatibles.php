<?php
namespace Yay_Wholesale\Engine;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Yay_Wholesale\Engine\Compatibles\YayCurrency;
use Yay_Wholesale\Engine\Compatibles\YayExtra;
use Yay_Wholesale\Engine\Compatibles\YayMail;
use Yay_Wholesale\Utils\SingletonTrait;

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
