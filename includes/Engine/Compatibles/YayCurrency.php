<?php
namespace Yay_Wholesale\Engine\Compatibles;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayCurrency Compatible
 */
class YayCurrency {
    use SingletonTrait;

    protected function __construct() {
        if ( ! defined( 'YAY_CURRENCY_VERSION' ) ) {
            return;
        }

        // LITE
        add_filter( 'ywhs_price_handle_processed', [ $this, 'convert_currency_price' ], 10, 1 );
        add_filter( 'ywhs_ajax_refetch_prices_from_checkout', [ $this, 'is_refetch_price_from_checkout' ], 10, 1 );
    }

    /* Convert the final price with YayCurrency */
    public function convert_currency_price( float $price ) {
        if ( is_admin() || is_checkout() ) {
            return $price;
        }
        $price = apply_filters( 'yay_currency_convert_price', $price );

        return $price;
    }

    /* Condition to refetch price in checkout page (for YayWholesale Requirement Block) */
    public function is_refetch_price_from_checkout( bool $is_refetch ) {
        return is_checkout();
    }
}
