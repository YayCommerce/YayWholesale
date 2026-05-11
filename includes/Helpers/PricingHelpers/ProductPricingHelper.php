<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

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

        if ( Utils::is_pro() ) {
            // Pro handle: (INCOMING)
            // Quantity Tier
            // Price for each Product
            // Discount for each Category
            $handled_price = null;
            if ( isset( $handled_price ) ) {
                return $handled_price;
            }
        }

        $discount = isset( $role_config['discount'] ) ? ( (float) $role_config['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $product->get_price();
        }

        $apply_to_sale = $role_config['applyToSalePrice'] ?? false;
        $regular_price = (float) $product->get_regular_price();
        $sale_price    = (float) $product->get_price();
        $price         = ( $apply_to_sale && $sale_price < $regular_price ) ? $sale_price : $regular_price;
        // var_dump( $price );

        return max( 0, ( $price ) * ( 1 - $discount ) );
    }
}
