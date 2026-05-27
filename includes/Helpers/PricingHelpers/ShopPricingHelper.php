<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;

/**
 * Shop Pricing Helper
 */
class ShopPricingHelper {

    /**
     * Get the wholesale price map of current cart item
     *
     * @param array $cart_item The current handling cart item.
     * @param array $role_config The wholesale role.
     * @param int   $quantity The quantity of items.
     * @return array The discounted price map
     */
    public static function  get_cart_item_wholesale_price( &$cart_item, $role_config, $quantity ) {
        $wholesale_price = ProductPricingHelper::get_wholesale_price( $cart_item['data'], $role_config, $quantity );

        $wholesale_extra = self::get_wholesale_extra_price_from_cart_item( $cart_item, $role_config );

        $final_price = max( 0, $wholesale_price + $wholesale_extra );

        return [
            'product_price' => $wholesale_price,
            'extra_price'   => $wholesale_extra,
            'final_price'   => $final_price,
        ];
    }

    /**
     * Get the wholesale extra from cart item
     *
     * @param array $cart_item The current handling cart item.
     * @param array $role_config The wholesale role.
     * @return float The discounted extra price
     */
    public static function get_wholesale_extra_price_from_cart_item( $cart_item, $role_config ) {
        $extra = apply_filters( 'ywhs_cart_item_extra_price_before_apply_discount', 0, $cart_item );
        return self::calculate_wholesale_discount_for_extra( $extra, $role_config );
    }

    /**
     * Get the wholesale price for displaying in shop
     *
     * @param \WC_Product $product The current handling product.
     * @param array       $role The wholesale role.
     * @return float The discounted price
     */
    public static function get_wholesale_price_for_display( $product, $role ) {

        if ( ! $role ) {
            return $product->get_price();
        }

        // if (! RequirementHelper::is_cart_meet_requirement( $role ) ) {
            // return $price;
            // }

        $discounted = ProductPricingHelper::get_wholesale_price( $product, $role, 1 );

        $decimals = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );

        $discounted = (float) wc_format_decimal( $discounted, $decimals );

        return apply_filters( 'ywhs_display_wholesale_price_additional_processed', $discounted, $product, $role );
    }

    /**
     * Get the wholesale price range of "Variable" products for displaying in shop
     *
     * @param \WC_Product $product The current handling product.
     * @param array       $role The wholesale role.
     * @return array The discounted prices of variants
     */
    public static function get_wholesale_prices_display_from_variants( $product, $role ) {
        if ( ! $product->is_type( 'variable' ) ) {
            return [];
        }

        // if ( ! RequirementHelper::is_cart_meet_requirement( $role ) ) {
            // return $price;
            // }

        $discounted = [];
        foreach ( $product->get_children() as $vid ) {
            $product = wc_get_product( $vid );
            if ( ! empty( $product ) ) {
                $discounted[] = self::get_wholesale_price_for_display( $product, $role );
            }
        }
        return $discounted;
    }

    /**
     * Get the wholesale price range of "Grouped" products for displaying in shop
     *
     * @param \WC_Product $product The current handling product.
     * @param array       $role The wholesale role.
     * @return array The discounted prices of group
     */
    public static function get_wholesale_prices_display_from_grouped( $product, $role ) {
        if ( ! $product->is_type( 'grouped' ) ) {
            return [];
        }
        $discounted = [];

        // if ( ! RequirementHelper::is_cart_meet_requirement( $role ) ) {
            // return $price;
            // }

        foreach ( $product->get_children() as $child_id ) {
            $product = wc_get_product( $child_id );
            if ( ! empty( $product ) ) {
                $discounted[] = self::get_wholesale_price_for_display( $product, $role );
            }
        }
        return $discounted;
    }

    /**
     * Handling calculate the extra price
     *
     * @param float $extra_price The extra price.
     * @param array $role_config The wholesale role.
     * @return float The discounted extra price
     */
    public static function calculate_wholesale_discount_for_extra( $extra_price, $role_config ) {
        $discount = isset( $role_config['discount'] ) ? ( (float) $role_config['discount'] / 100 ) : 0;
        if ( $discount < 0 ) {
            return $extra_price;
        }

        if ( $extra_price < 0 ) {
            return $extra_price;
        }

        $discounted_extra = max( 0, ( $extra_price ) * ( 1 - $discount ) );

        $decimals = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );

        return wc_format_decimal( $discounted_extra, $decimals );
    }
}
