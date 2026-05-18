<?php

namespace YayWholesaleB2B\ProEngine\Helpers\PricingHelpers;

/**
 * Category Based Pricing Helper
 */
class AdvancedPricingHelper {

    /**
     * Get final advanced price: handle with product-based, category-based, quantity-tier
     *
     * @param float       $price The product price.
     * @param \WC_Product $product The current handling product.
     * @param array       $wholesale_role The wholesale role.
     * @param int         $quantity the quantity of product.
     * @return float
     */
    public static function get_final_advanced_price( $price, $product, $wholesale_role, $quantity = 1 ) {

        // Product based price
        $product_based_price = ProductPricingHelper::calculate_product_based_price( $price, $product->get_id(), $wholesale_role );

        if ( $product_based_price ) {
            return $product_based_price;
        }

        // Category based price
        $category_based_price = CategoryPricingHelper::calculate_category_based_price( $price, $product, $wholesale_role );

        if ( $category_based_price ) {
            return $category_based_price;
        }

        return false;
    }

    /**
     * Get final advanced wholesale discount data: discount type (rule), discount value (fixed or rate)
     *
     * @param \WC_Product $product The current handling product.
     * @param array       $wholesale_role The wholesale role.
     * @param int         $quantity the quantity of product.
     * @return array
     */
    public static function get_final_advanced_discount_data( $product, $wholesale_role, $quantity ) {
        // Product based discount
        $product_based_discount = ProductPricingHelper::get_product_based_discount( $product->get_id(), $wholesale_role );

        if ( ! empty( $product_based_discount ) ) {
            return $product_based_discount;
        }

        // Category based discount
        $category_based_discount = CategoryPricingHelper::get_category_based_discount( $product, $wholesale_role );

        if ( ! empty( $category_based_discount ) ) {
            return $category_based_discount;
        }

        return false;
    }
}
