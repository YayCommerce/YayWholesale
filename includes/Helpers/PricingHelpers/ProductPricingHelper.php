<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;

/**
 * Product Pricing Helper
 */
class ProductPricingHelper {

    /**
     * Get the wholesale price of product (No Extra included)
     *
     * @param \WC_Product $product
     * @param array|null  $role_config The wholesale role configuration. Or null if guest or retailer.
     * @param int         $quantity quantity in cart.
     * @return float The discounted price
     */
    public static function get_wholesale_price( $product, $role_config = null, $quantity = 1 ) {

        $regular_price = (float) $product->get_regular_price( 'edit' );
        $sale_price    = (float) $product->get_price( 'edit' );

        if ( $role_config === null ) {
            $before_discount_price = $sale_price;
            $wholesale_price       = $sale_price;
        } else {
            $before_discount_price = ( $role_config['applyToSalePrice'] && $sale_price < $regular_price ) ? $sale_price : $regular_price;
            $discount              = isset( $role_config['discount'] ) ? ( (float) $role_config['discount'] / 100 ) : 0;
            if ( $discount <= 0 ) {
                $wholesale_price = $before_discount_price;
            } else {
                $wholesale_price = max( 0, ( $before_discount_price ) * ( 1 - $discount ) );
            }
        }

        $wholesale_price = apply_filters( 'ywhs_calculate_wholesale_product_price', $wholesale_price, $before_discount_price, $product, $role_config, $quantity );

        $decimals = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );
        return wc_format_decimal( $wholesale_price, $decimals );
    }

    /**
     * Get the wholesale discount data of current product (discount type, discount value)
     *
     * @param \WC_Product $product
     * @param array|null  $role_config The wholesale role configuration. Or null if guest or retailer.
     * @param int         $quantity quantity in cart.
     * @return array The discount data
     */
    public static function  get_product_wholesale_discount_data( $product, $role_config = null, $quantity = 0 ) {
        $data = [];
        if ( empty( $role_config ) ) {
            $role_config = CustomerHelper::get_current_user_wholesale_role();

            if ( empty( $role_config ) ) {
                $data = [];
            } else {
                $data = [
                    'wholesale_discount_type'  => 'rate',
                    'wholesale_discount_value' => $role_config['discount'],
                ];
            }
        }

        $data = apply_filters( 'ywhs_wholesale_discount_data', $data, $product, $role_config, $quantity );

        return $data;
    }
}
