<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use YayWholesaleB2B\Pro\Helpers\PricingHelpers\CategoryPricingHelper;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\ProductPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Advanced Pricing feature
 */
class Pricing {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'ywhs_calculate_wholesale_product_price', [ $this, 'get_final_advanced_price' ], 10, 5 );
        add_filter( 'ywhs_wholesale_discount_data', [ $this, 'get_final_advanced_discount_data' ], 10, 4 );
    }

    /**
     * Get final advanced price: handle with product-based, category-based, quantity-tier
     *
     * @param float       $discounted_price The role-based discounted product price.
     * @param float       $before_discounted_price The original product price.
     * @param \WC_Product $product The current handling product.
     * @param array       $wholesale_role The wholesale role.
     * @param int         $quantity the quantity of product.
     * @return float
     */
    public static function get_final_advanced_price( $discounted_price, $before_discounted_price, $product, $wholesale_role, $quantity = 1 ) {
        if ( ! isset( $wholesale_role ) ) {
            return $discounted_price;
        }

        // Product based price
        $product_based_price = ProductPricingHelper::calculate_product_based_price( $before_discounted_price, $product->get_id(), $wholesale_role );

        if ( $product_based_price ) {
            return $product_based_price;
        }

        // Category based price
        $category_based_price = CategoryPricingHelper::calculate_category_based_price( $before_discounted_price, $product, $wholesale_role );

        if ( $category_based_price ) {
            return $category_based_price;
        }

        return $discounted_price;
    }

    /**
     * Get final advanced wholesale discount data: discount type (rule), discount value (fixed or rate)
     *
     * @param array       $discount_data The discount data (included discount type, discount value).
     * @param \WC_Product $product The current handling product.
     * @param array       $wholesale_role The wholesale role.
     * @param int         $quantity the quantity of product.
     * @return array
     */
    public static function get_final_advanced_discount_data( $discount_data, $product, $wholesale_role, $quantity ) {
        if ( ! isset( $wholesale_role ) ) {
            return $discount_data;
        }

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

        return $discount_data;
    }
}
