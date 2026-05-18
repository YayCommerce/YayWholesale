<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\Utils;

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

        if ( $role_config === null ) {
            return $product->get_price();
        }

        $regular_price = (float) $product->get_regular_price( 'edit' );
        $sale_price    = (float) $product->get_price( 'edit' );
        $price         = ( $role_config['applyToSalePrice'] && $sale_price < $regular_price ) ? $sale_price : $regular_price;

        if ( Utils::is_pro() ) {
            // Pro handle: Quantity Tier, Product-based, Category-based
            $handled_price = \YayWholesaleB2B\ProEngine\Helpers\PricingHelpers\AdvancedPricingHelper::get_final_advanced_price( $price, $product, $role_config, $quantity );
            if ( ! empty( $handled_price ) ) {
                return $handled_price;
            }
        }

        $discount = isset( $role_config['discount'] ) ? ( (float) $role_config['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $product->get_price();
        }

        $wholesale_price = max( 0, ( $price ) * ( 1 - $discount ) );

        $decimals = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );

        return wc_format_decimal( $wholesale_price, $decimals );
    }

    public static function  get_product_wholesale_discount_data( $product, $role_config = null, $quantity = 0 ) {
        $data = [];
        if ( empty( $role_config ) ) {
            $role_config = CustomerHelper::get_current_user_wholesale_role();

            if ( empty( $role_config ) ) {
                return $data;
            }
        }

        if ( Utils::is_pro() ) {
            // Pro handle: Quantity Tier, Product-based, Category-based
            $data = \YayWholesaleB2B\ProEngine\Helpers\PricingHelpers\AdvancedPricingHelper::get_final_advanced_discount_data( $product, $role_config, $quantity );

            if ( ! empty( $data ) ) {
                return $data;
            }
        }

        return [
            'wholesale_discount_type'  => 'rate',
            'wholesale_discount_value' => $role_config['discount'],
        ];
    }
}
