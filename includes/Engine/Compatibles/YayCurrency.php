<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Utils\SingletonTrait;

use Yay_Currency\Helpers\YayCurrencyHelper;
use Yay_Currency\Helpers\SupportHelper;
use YayWholesaleB2B\Helpers\PricingHelper;
use YayWholesaleB2B\Helpers\RolesHelper;

defined( 'ABSPATH' ) || exit;

/**
 * YayCurrency Compatible
 */
class YayCurrency {
    use SingletonTrait;

    protected function __construct() {

        add_filter( 'ywhs_convert_price_from_order', [ $this, 'convert_price_in_order' ], 10, 3 );

        if ( ! defined( 'YAY_CURRENCY_VERSION' ) ) {
            return;
        }

        // LITE
        add_filter( 'ywhs_price_handle_processed', [ $this, 'convert_currency_price' ], 10, 1 );
        add_filter( 'ywhs_product_price_ajax_handled', [ $this, 'product_price_ajax_handle' ], 10, 3 );
        add_filter( 'ywhs_ajax_using_default_currency', [ $this, 'is_using_default_price' ], 10, 1 );
        add_filter( 'ywhs_get_currency_by_third_party', [ $this, 'get_currency' ], 10, 1 );
        add_filter( 'YayCurrency/StoreCurrency/GetCartSubtotal', [ $this, 'calculate_cart_subtotal_in_checkout' ], 20, 1 );
        add_filter( 'YayCurrency/Checkout/FallbackCurrency/GetProductPrice', [ $this, 'calculate_product_price_in_checkout' ], 20, 2 );
        add_filter( 'YayCurrency/ApplyCurrency/GetProductPrice', [ $this, 'calculate_approximate_product_price_in_checkout' ], 20, 2 );
        add_filter( 'yay_currency_get_approximately_formatted_price', [ $this, 'get_approximately_formatted_price' ], 10, 4 );
    }

    // Order have Meta-data: yay_currency_order_rate to revert the original price of order
    public function convert_price_in_order( $price, \WC_Order $order, $is_reverting_to_original_currency ) {
        if ( defined( 'YAY_CURRENCY_VERSION' ) && class_exists( 'Yay_Currency\Helpers\YayCurrencyHelper' ) ) {
            $apply_currency = YayCurrencyHelper::get_currency_by_currency_code( $order->get_currency() );

            if ( $apply_currency ) {
                if ( $is_reverting_to_original_currency ) {
                    $price = YayCurrencyHelper::reverse_calculate_price_by_currency( $price, $apply_currency );
                } else {
                    $price = YayCurrencyHelper::calculate_price_by_currency( $price, false, $apply_currency );
                }
            }

            return (float) $price;
        } else {
            $rate = $order->get_meta( 'yay_currency_order_rate' );

            if ( ! isset( $rate ) ) {
                return $price;
            }

            if ( $is_reverting_to_original_currency ) {
                $price = floatval( $price ) / max( 1, floatval( $rate ) );
            } else {
                $price = floatval( $price ) * max( 1, floatval( $rate ) );
            }

            return $price;
        }//end if
    }

    /* Convert the final price with YayCurrency */
    public function convert_currency_price( $price ) {
        if ( ! defined( 'YAY_CURRENCY_VERSION' ) ) {
            return $price;
        }

        if ( is_checkout() || self::is_checkout_blocks() ) {
            $current_currency = YayCurrencyHelper::detect_current_currency();

            if ( YayCurrencyHelper::is_dis_checkout_diff_currency( $current_currency ) ) {
                if ( YayCurrencyHelper::is_checkout_in_fallback() ) {
                    $fallback_currency = YayCurrencyHelper::get_fallback_currency();
                    if ( ! isset( $fallback_currency ) ) {
                        return $price;
                    }

                    return YayCurrencyHelper::calculate_price_by_currency( $price, false, $fallback_currency );
                }
                return $price;
            }
        }

        $price = apply_filters( 'yay_currency_convert_price', $price );

        return $price;
    }

    /* Condition to refetch price in checkout page (for YayWholesale Requirement Block) */
    public function is_using_default_price( bool $is_using_default ) {
        $current_currency = YayCurrencyHelper::detect_current_currency();
        return ( is_checkout() || self::is_checkout_blocks() ) && YayCurrencyHelper::is_dis_checkout_diff_currency( $current_currency );
    }

    /* Get the current currency */
    public function get_currency( $currency = [] ) {
        $currency = YayCurrencyHelper::detect_current_currency();

        if ( ( is_checkout() || self::is_checkout_blocks() ) && ( YayCurrencyHelper::is_dis_checkout_diff_currency( $currency ) ) ) {
            $fallback_currency = YayCurrencyHelper::get_fallback_currency();
            if ( isset( $fallback_currency ) ) {
                $currency = $fallback_currency;
            }
        }

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

    public function product_price_ajax_handle( $price, $product, $type = 'price' ) {

        $product_price = $product->get_price( 'edit' );

        if ( 'regular' === $type ) {
            $product_price = $product->get_regular_price( 'edit' );
        }

        if ( 'sale' === $type ) {
            $product_price = $product->get_sale_price( 'edit' );
        }

        $apply_currency = YayCurrencyHelper::detect_current_currency();

        if ( $apply_currency ) {
            $product_price = YayCurrencyHelper::calculate_price_by_currency( $product_price, false, $apply_currency );
            if ( class_exists( 'Yay_Currency\Helpers\FixedPriceHelper' ) ) {
                $product_price = \Yay_Currency\Helpers\FixedPriceHelper::get_price_fixed_by_apply_currency( $product, $product_price, $apply_currency );
            }
        }

        return (float) $product_price;
    }

    public function calculate_product_price_in_checkout( $product_price, $product ) {
        if ( ! WC()->cart ) {
            return $product_price;
        }
        $cart = WC()->cart;
        if ( 'incl' === $cart->tax_display_cart ) {
            return wc_get_price_including_tax( $product );
        } else {
            return wc_get_price_excluding_tax( $product );
        }
    }

    public function calculate_cart_subtotal_in_checkout( $subtotal ) {
        if ( ! WC()->cart ) {
            return $subtotal;
        }
        $cart = WC()->cart;
        if ( 'incl' === $cart->tax_display_cart ) {
            return $cart->get_subtotal() + $cart->get_subtotal_tax();
        } else {
            return $cart->get_subtotal();
        }
    }

    public function calculate_approximate_product_price_in_checkout( $product_price, $product ) {
        if ( ! WC()->cart ) {
            return $product_price;
        }
        $cart = WC()->cart;
        if ( 'incl' === $cart->tax_display_cart ) {
            $price = wc_get_price_including_tax( $product );
        } else {
            $price = wc_get_price_excluding_tax( $product );
        }

        $apply_currency = YayCurrencyHelper::detect_current_currency();

        if ( $apply_currency ) {
            return YayCurrencyHelper::calculate_price_by_currency( $price, false, $apply_currency );
        }

        return $price;
    }

    public function get_approximately_formatted_price( $formatted_price, $product, $approximately_price_data, $apply_currency ) {
        if ( ! is_user_logged_in() || ! isset( $approximately_price_data['approximately_apply_currency'] ) ) {
            return $formatted_price;
        }

        if ( 'variable' === $product->get_type() ) {
            return $formatted_price;
        }

        $wholesale_role = RolesHelper::is_wholesale_user();

        if ( ! $wholesale_role ) {
            return $formatted_price;
        }

        $calculate_product_price = $product->get_price( 'edit' );

        if ( PricingHelper::meets_discount_conditions( $wholesale_role ) ) {
            $calculate_product_price = PricingHelper::calc_discounted_price( $calculate_product_price, $wholesale_role, $product );
        }

        $regular_price = wc_get_price_to_display(
            $product,
            [
                'price' => $product->get_price( 'edit' ),
            ]
        );

        $sale_price = $product->get_sale_price( 'edit' );
        $sale_price = wc_get_price_to_display(
            $product,
            [
                'price' => $sale_price > 0 ? $sale_price : $calculate_product_price,
            ]
        );
        $params     = $approximately_price_data['params'];

        $final_price = ! empty( $approximately_price_data['approximately_apply_currency'] )
            ? YayCurrencyHelper::calculate_price_by_currency( $sale_price, false, $approximately_price_data['approximately_apply_currency'] )
            : $sale_price * floatval( $params['rate'] );

        $formatted_final_price = SupportHelper::get_formatted_price( $final_price, $params );
        if ( $regular_price === $sale_price ) {
            return $formatted_final_price;
        }

        $regular_price = ! empty( $approximately_price_data['approximately_apply_currency'] )
            ? YayCurrencyHelper::calculate_price_by_currency( $regular_price, false, $approximately_price_data['approximately_apply_currency'] )
            : $regular_price * floatval( $params['rate'] );

        $formatted_regular_price = SupportHelper::get_formatted_price( $regular_price, $params );
        return wc_format_sale_price( $formatted_regular_price, $formatted_final_price );
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
