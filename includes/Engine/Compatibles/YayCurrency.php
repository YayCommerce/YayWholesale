<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Utils\SingletonTrait;

use Yay_Currency\Helpers\YayCurrencyHelper;

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
        add_filter( 'ywhs_ajax_using_default_currency', [ $this, 'is_refetch_price_from_checkout' ], 10, 1 );
        add_filter( 'ywhs_get_currency_by_third_party', [ $this, 'get_currency' ], 10, 1 );
    }

    /* Convert the final price with YayCurrency */
    public function convert_currency_price( $price ) {
        if ( is_checkout() || self::is_checkout_blocks() ) {
            return $price;
        }

        $price = apply_filters( 'yay_currency_convert_price', $price );

        return $price;
    }

    /* Condition to refetch price in checkout page (for YayWholesale Requirement Block) */
    public function is_refetch_price_from_checkout( bool $is_refetch ) {
        return is_checkout();
    }

    /* Get the current currency */
    public function get_currency( $currency = [] ) {
        $currency = YayCurrencyHelper::get_current_currency( $currency );

        $formatted_currency = [
            'currency'     => $currency['currency'],
            'symbol'       => $currency['symbol'],
            'position'     => $currency['currencyPosition'],
            'thousand_sep' => $currency['thousandSeparator'],
            'decimal_sep'  => $currency['decimalSeparator'],
            'num_decimals' => $currency['numberDecimal'],
            'rate'         => $currency['rate'],
        ];
        return $formatted_currency;
    }

    /*Woocommerce Checkout Block support */
    protected static function is_checkout_blocks() {

        // Return false if not rest api request
        if ( ! self::detect_wc_store_rest_api_doing() ) {
            return false;
        }

        // Return true if force country by checkout blocks page
        if ( 'checkout' === self::get_wc_blocks_page_context() ) {
            return true;
        }

        return apply_filters( 'YayCurrency/WooBlocks/IsCheckout', false );
    }

    protected static function detect_wc_store_rest_api_doing() {
        if ( ! WC()->is_rest_api_request() ) {
            return false;
        }

        if ( ! isset( $GLOBALS['wp']->query_vars['rest_route'] ) || empty( $GLOBALS['wp']->query_vars['rest_route'] ) ) {
            $rest_route = false;
        } else {
            $rest_route = $GLOBALS['wp']->query_vars['rest_route'];
        }

        return $rest_route && strpos( $rest_route, '/wc/store/' ) === 0;
    }

    protected static function get_wc_blocks_page_context() {
        $page_context = '';

        if ( ! self::detect_wc_store_rest_api_doing() ) {
            return $page_context;
        }

        if ( isset( $_SERVER['HTTP_YAYCURRENCY_WC_BLOCKS_CONTEXT'] ) ) {
            $page_context = sanitize_text_field( wp_unslash( $_SERVER['HTTP_YAYCURRENCY_WC_BLOCKS_CONTEXT'] ) );
        }

        return $page_context;
    }
}
