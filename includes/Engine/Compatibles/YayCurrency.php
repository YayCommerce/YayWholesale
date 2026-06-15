<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Utils\SingletonTrait;

use Yay_Currency\Helpers\YayCurrencyHelper;
use Yay_Currency\Helpers\Helper;
use Yay_Currency\Helpers\SupportHelper;
use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\PricingHelpers\ProductPricingHelper;
use YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Utils\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * YayCurrency Compatible
 */
class YayCurrency {
    use SingletonTrait;

    private $apply_currency = [];

    protected function __construct() {

        // Expected to work even if the YayCurrency not activated
        add_filter( 'ywhs_convert_price_from_order', [ $this, 'convert_price_in_order' ], 10, 3 );
        add_filter( 'ywhs_revert_price_from_order', [ $this, 'revert_price_in_order' ], 10, 2 );

        if ( ! defined( 'YAY_CURRENCY_VERSION' ) ) {
            return;
        }

        $this->apply_currency = YayCurrencyHelper::detect_current_currency();

        // Convert Revenue from customer (WholesalerList Page)
        add_filter( 'ywhs_wholesaler_stats_sql_query', [ $this, 'wholesaler_stats_sql_query' ], 10, 3 );
        // YayWholesale Hooks
        add_filter( 'ywhs_after_calc_price_additional_processed', [ $this, 'convert_currency_price' ], 10, 3 );
        add_filter( 'ywhs_display_wholesale_price_additional_processed', [ $this, 'convert_currency_price' ], 10, 3 );
        add_filter( 'ywhs_product_price_ajax_handled', [ $this, 'product_price_ajax_handle' ], 10, 3 );
        add_filter( 'ywhs_ajax_using_default_currency', [ $this, 'is_using_default_price' ], 10, 1 );
        add_filter( 'ywhs_get_currency_by_third_party', [ $this, 'get_currency' ], 10, 1 );

        // YayCurrency Hooks
        add_filter( 'YayCurrency/StoreCurrency/GetCartSubtotal', [ $this, 'calculate_cart_subtotal_in_checkout' ], 20, 1 );
        add_filter( 'YayCurrency/Checkout/FallbackCurrency/GetProductPrice', [ $this, 'calculate_product_price_in_checkout' ], 20, 2 );
        add_filter( 'YayCurrency/ApplyCurrency/GetProductPrice', [ $this, 'calculate_approximate_product_price_in_checkout' ], 20, 2 );

        // Pricing
        add_action( 'yay_currency_set_cart_contents', [ $this, 'product_addons_set_cart_contents' ], 20, 4 );
        add_filter( 'yay_currency_product_price_3rd_with_condition', [ $this, 'get_price_with_options' ], 20, 2 );
        add_filter( 'yay_currency_get_price_fixed_by_currency', [ $this, 'get_product_price_fixed_3rd_plugin' ], 10, 4 );
        // // Fallback Currency + Pricing
        add_filter( 'YayCurrency/FallbackCurrency/GetPrice', [ $this, 'get_fallback_price_in_checkout_page' ], 30, 4 );
        // // No Checkout in difference currency + Pricing
        add_filter( 'YayCurrency/StoreCurrency/GetPrice', [ $this, 'get_price_default_in_checkout_page' ], 30, 2 );
    }

    public function get_product_price_fixed_3rd_plugin( $fixed_price, $product, $apply_currency, $product_price ) {
        if ( class_exists( 'Yay_Currency\Helpers\FixedPriceHelper' ) ) {
            $custom_fixed_prices = \Yay_Currency\Helpers\FixedPriceHelper::get_custom_fixed_prices( $product->get_id(), $apply_currency['currency'] );

            $regular_price = (float) \Yay_Currency\Helpers\FixedPriceHelper::get_regular_price( $custom_fixed_prices, -1 );
            if ( $regular_price < 0 ) {
                return $product_price;
            }
            $sale_price = (float) \Yay_Currency\Helpers\FixedPriceHelper::get_sale_price( $custom_fixed_prices, -1 );

            $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
            $base_price     = $wholesale_role['applyToSalePrice'] && $sale_price > 0 ? $sale_price : $regular_price;
            $discount_data  = ProductPricingHelper::get_product_wholesale_discount_data( $product, $wholesale_role, 1 );

            if ( $discount_data['wholesale_discount_type'] === 'fixed' ) {
                return $product_price;
            } else {
                return $base_price * ( 1 - floatval( $discount_data['wholesale_discount_value'] ) / 100 );
            }
        }
        return $product_price;
    }

    protected function is_has_yaycurrency_fixed_price( $price, $product, $apply_currency, $is_strict ) {
        if ( class_exists( 'Yay_Currency\Helpers\FixedPriceHelper' ) ) {
            $custom_fixed_prices = \Yay_Currency\Helpers\FixedPriceHelper::get_custom_fixed_prices( $product->get_id(), $apply_currency['currency'] );
            if ( $custom_fixed_prices ) {
                // Just determine that this product have fixed price settings
                if ( ! $is_strict && (float) $custom_fixed_prices['price'] > 0 ) {
                    return true;
                }

                // determine that this product have fixed price settings and price accuracy
                if ( $is_strict && (
                $price === (float) \Yay_Currency\Helpers\FixedPriceHelper::get_regular_price( $custom_fixed_prices, -1 )
                || $price === (float) \Yay_Currency\Helpers\FixedPriceHelper::get_sale_price( $custom_fixed_prices, -1 )
                ) ) {
                        return true;
                }
            }
            return false;
        }
    }

    // Order have Meta-data: yay_currency_order_rate to revert the original price of order
    public function convert_price_in_order( $price, \WC_Order $order, $product ) {
        $original_currency = get_woocommerce_currency();

        // If the order's currency is same as store system then do nothing
        if ( $order->get_currency() === $original_currency ) {
            return $price;
        }

        if ( defined( 'YAY_CURRENCY_VERSION' ) && class_exists( 'Yay_Currency\Helpers\YayCurrencyHelper' ) ) {

            $apply_currency = YayCurrencyHelper::get_currency_by_currency_code( $order->get_currency() );

            if ( $apply_currency ) {
                $price = YayCurrencyHelper::calculate_price_by_currency( $price, false, $apply_currency );
                if ( $product && class_exists( 'Yay_Currency\Helpers\FixedPriceHelper' ) ) {
                    $price = \Yay_Currency\Helpers\FixedPriceHelper::get_price_fixed_by_apply_currency( $product, $price, $this->apply_currency );
                }
            }

            return (float) $price;
        } else {
            $rate = $order->get_meta( 'yay_currency_order_rate' );

            if ( ! isset( $rate ) ) {
                return $price;
            }

            $price = floatval( $price ) * max( 1, floatval( $rate ) );

            return $price;
        }//end if
    }

    public function revert_price_in_order( $price, \WC_Order $order ) {
        $original_currency = get_woocommerce_currency();

        // If the order's currency is same as store system then do nothing
        if ( $order->get_currency() === $original_currency ) {
            return $price;
        }

        if ( defined( 'YAY_CURRENCY_VERSION' ) && class_exists( 'Yay_Currency\Helpers\YayCurrencyHelper' ) ) {
            $apply_currency = YayCurrencyHelper::get_currency_by_currency_code( $order->get_currency() );

            if ( $apply_currency ) {
                // if ( $product && $this->is_has_yaycurrency_fixed_price( $price, $product, $apply_currency, true ) ) {
                // return $product->get_price( 'edit' );
                // }
                    return YayCurrencyHelper::reverse_calculate_price_by_currency( $price, $apply_currency );

            }

            return (float) $price;
        } else {
            $rate = $order->get_meta( 'yay_currency_order_rate' );

            if ( ! isset( $rate ) ) {
                return $price;
            }

            $price = floatval( $price ) / max( 1, floatval( $rate ) );

            return $price;
        }//end if
    }

    public function stats_extra_joins( $extra_joins, $is_hpos ) {
        global $wpdb;
        if ( ! $is_hpos ) {
            return $extra_joins;
        }
        return $extra_joins . " LEFT JOIN {$wpdb->prefix}wc_orders_meta rate ON rate.order_id = o.id AND rate.meta_key = 'yay_currency_order_rate'";
    }

    public function wholesaler_revenue_sql( $revenue_sql, $is_hpos ) {
        if ( ! $is_hpos ) {
            return $revenue_sql;
        }
        $store_currency = esc_sql( Helper::default_currency_code() );
        return "SUM(CASE WHEN o.currency = '{$store_currency}' THEN o.total_amount ELSE o.total_amount / GREATEST(1,CAST(rate.meta_value AS DECIMAL(20,8))) END)";
    }

    public function wholesaler_stats_sql_query( $sql_query, $user_ids, $is_hpos ) {
        global $wpdb;
        $placeholders   = implode( ',', array_fill( 0, count( $user_ids ), '%d' ) );
        $store_currency = esc_sql( Helper::default_currency_code() );
        if ( $is_hpos ) {
            $sql_query = "SELECT o.customer_id,COUNT(o.id) AS completed_orders,SUM(CASE WHEN o.currency = '{$store_currency}' THEN o.total_amount ELSE o.total_amount / GREATEST(1,CAST(rate.meta_value AS DECIMAL(20,8))) END) AS revenue
                FROM {$wpdb->prefix}wc_orders o
                INNER JOIN {$wpdb->prefix}wc_orders_meta wm ON wm.order_id = o.id AND wm.meta_key = '_ywhs_wholesale_role' AND wm.meta_value <> ''
                LEFT JOIN {$wpdb->prefix}wc_orders_meta rate ON rate.order_id = o.id AND rate.meta_key = 'yay_currency_order_rate'
                WHERE o.status = 'wc-completed' AND o.customer_id IN ($placeholders)
                GROUP BY o.customer_id";
        } else {
            $sql_query = "SELECT customer.meta_value AS customer_id,COUNT(DISTINCT p.ID) AS completed_orders,SUM(CASE WHEN currency.meta_value = '{$store_currency}' THEN CAST(total.meta_value AS DECIMAL(20,8)) ELSE CAST(total.meta_value AS DECIMAL(20,8))/ GREATEST( 1,CAST(rate.meta_value AS DECIMAL(20,8)))END) AS revenue
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->postmeta} customer ON customer.post_id = p.ID AND customer.meta_key = '_customer_user'
                INNER JOIN {$wpdb->postmeta} total ON total.post_id = p.ID AND total.meta_key = '_order_total'
                INNER JOIN {$wpdb->postmeta} wholesale ON wholesale.post_id = p.ID AND wholesale.meta_key = '_ywhs_wholesale_role' AND wholesale.meta_value <> ''
                LEFT JOIN {$wpdb->postmeta} currency ON currency.post_id = p.ID AND currency.meta_key = '_order_currency'
                LEFT JOIN {$wpdb->postmeta} rate ON rate.post_id = p.ID AND rate.meta_key = 'yay_currency_order_rate'
                WHERE p.post_type = 'shop_order' AND p.post_status = 'wc-completed' AND customer.meta_value IN ($placeholders)
                GROUP BY customer.meta_value";
        }

        return $sql_query;
    }

    /* Convert the final price with YayCurrency */
    public function convert_currency_price( $price, $product, $role_config ) {
        if ( ! defined( 'YAY_CURRENCY_VERSION' ) ) {
            return $price;
        }

        $current_currency = YayCurrencyHelper::detect_current_currency();
        if ( is_checkout() || Utils::is_checkout_blocks() ) {

            if ( YayCurrencyHelper::is_dis_checkout_diff_currency( $current_currency ) ) {
                if ( method_exists( YayCurrencyHelper::class, 'is_checkout_in_fallback' )
                && YayCurrencyHelper::is_checkout_in_fallback() ) {
                    $fallback_currency = YayCurrencyHelper::get_fallback_currency();
                    if ( ! isset( $fallback_currency ) ) {
                        return $price;
                    }

                    return YayCurrencyHelper::calculate_price_by_currency( $price, false, $fallback_currency );
                }
                return $price;
            }
        }

        // Price with Product: YayWholesale fixed > YayCurrency fixed, if percentage use with YayCurrency fixed
        if ( $product && $this->is_has_yaycurrency_fixed_price( $price, $product, $current_currency, false ) ) {
            $custom_fixed_prices = \Yay_Currency\Helpers\FixedPriceHelper::get_custom_fixed_prices( $product->get_id(), $this->apply_currency['currency'] );
            $regular_price       = (float) \Yay_Currency\Helpers\FixedPriceHelper::get_regular_price( $custom_fixed_prices, -1 );
            $sale_price          = (float) \Yay_Currency\Helpers\FixedPriceHelper::get_sale_price( $custom_fixed_prices, -1 );

            if ( empty( $role_config ) ) {
                return $sale_price > 0 ? $sale_price : $regular_price;
            }

            $rate = (float) $role_config['discount'];

            $discount_data = ProductPricingHelper::get_product_wholesale_discount_data( $product, $role_config, 0 );

            if ( ! empty( $discount_data ) ) {
                if ( 'rate' === $discount_data['wholesale_discount_type'] ) {
                    $rate = (float) $discount_data['wholesale_discount_value'];
                } else {
                    return apply_filters( 'yay_currency_convert_price', (float) $discount_data['wholesale_discount_value'] );
                }
            }

            $discount_price = ( $role_config['applyToSalePrice'] && $sale_price > 0 ) ? $sale_price : $regular_price;

            $discount_price = max( 0, $discount_price * ( 1 - ( $rate / 100 ) ) );

            return wc_format_decimal( $discount_price, wc_get_price_decimals() );
        }//end if

        $price = apply_filters( 'yay_currency_convert_price', $price );

        return $price;
    }

    /* Condition to refetch price in checkout page (for YayWholesale Requirement Block) */
    public function is_using_default_price( bool $is_using_default ) {
        $current_currency = YayCurrencyHelper::detect_current_currency();
        return ( is_checkout() || Utils::is_checkout_blocks() ) && YayCurrencyHelper::is_dis_checkout_diff_currency( $current_currency );
    }

    /* Get the current currency */
    public function get_currency( $currency = [] ) {
        $currency = YayCurrencyHelper::detect_current_currency();

        if ( ( is_checkout() || Utils::is_checkout_blocks() ) && ( YayCurrencyHelper::is_dis_checkout_diff_currency( $currency ) ) ) {
            if ( method_exists( YayCurrencyHelper::class, 'get_fallback_currency' ) ) {
                $fallback_currency = YayCurrencyHelper::get_fallback_currency();
                if ( isset( $fallback_currency ) ) {
                    $currency = $fallback_currency;
                }
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

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        if ( ! $wholesale_role ) {
            return $formatted_price;
        }

        $calculate_product_price = $product->get_price( 'edit' );

        if ( RequirementHelper::is_cart_meet_requirement( $wholesale_role ) ) {
            $calculate_product_price = ProductPricingHelper::get_wholesale_price( $product, $wholesale_role, 1 );
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

    public function get_fallback_price_in_checkout_page( $fallback_price, $price, $product, $fallback_currency ) {
        $wholesale_price = SupportHelper::get_cart_item_objects_property( $product, 'yay_currency_wholesale_price_fallback' );
        if ( $wholesale_price ) {
            return (float) $wholesale_price;
        }

        return $price;
    }

    public function get_price_default_in_checkout_page( $price, $product ) {
        $wholesale_price = SupportHelper::get_cart_item_objects_property( $product, 'yay_currency_wholesale_price_default' );
        if ( $wholesale_price ) {
            return (float) $wholesale_price;
        }

        return $price;
    }

    public function get_price_with_options( $price, $product ) {
        $wholesale_price = SupportHelper::get_cart_item_objects_property( $product, 'yay_currency_wholesale_price' );
        if ( $wholesale_price ) {
            return (float) $wholesale_price;
        }

        return $price;
    }

    public function product_addons_set_cart_contents( $cart_contents, $cart_item_key, $cart_item, $apply_currency ) {
        // Not necessary to recalculate - only run when it's required
        // $is_force_recalculate = apply_filters( 'ywhs_force_recalculate_in_yay_currency', false );
        // if ( ! $is_force_recalculate ) {
        // return;
        // }
        $role_config = CustomerHelper::get_current_user_wholesale_role();

        $origin_price    = $cart_item['data']->get_regular_price( 'edit' );
        $wholesale_extra = ShopPricingHelper::get_wholesale_extra_price_from_cart_item( $cart_item, $role_config );
        $wholesale_price = $origin_price - $wholesale_extra;

        if ( method_exists( YayCurrencyHelper::class, 'get_fallback_currency' ) ) {
            $fallback_currency = YayCurrencyHelper::get_fallback_currency();
            $fallback_price    = YayCurrencyHelper::convert_product_price( $wholesale_price, $cart_item['data'], $fallback_currency, true );
            $fallback_extra    = YayCurrencyHelper::calculate_price_by_currency( $wholesale_extra, false, $fallback_currency );
            SupportHelper::set_cart_item_objects_property( $cart_contents[ $cart_item_key ]['data'], 'yay_currency_wholesale_price_fallback', $fallback_price + $fallback_extra );
        }

        if ( method_exists( YayCurrencyHelper::class, 'convert_product_price' ) ) {
            $converted_price = YayCurrencyHelper::convert_product_price( $wholesale_price, $cart_item['data'], $apply_currency, true );
        } else {
            $converted_price = YayCurrencyHelper::calculate_price_by_currency( $wholesale_price, false, $apply_currency );
        }
        $converted_extra = YayCurrencyHelper::calculate_price_by_currency( $wholesale_extra, false, $apply_currency );

        SupportHelper::set_cart_item_objects_property( $cart_contents[ $cart_item_key ]['data'], 'yay_currency_wholesale_price', $converted_price + $converted_extra );
        SupportHelper::set_cart_item_objects_property( $cart_contents[ $cart_item_key ]['data'], 'yay_currency_wholesale_price_default', $origin_price );
    }
}
