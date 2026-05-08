<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Utils\Utils;

/**
 * Common Helper
 */
class ShopPricingHelper {

    /**
     * Get the wholesale price for calculating in cart / checkout
     *
     * @param \WC_Product $product The current handling product.
     * @param int         $quantity The current quantity in cart.
     * @param bool        $is_checking_mov If it need to be checked with requirements (MOV).
     * @return float The discounted price
     */
    public static function get_wholesale_price( $product, $quantity, $is_checking_mov = false ) {

        $role = CustomerHelper::get_current_user_wholesale_role();
        if ( ! $role ) {
            return $product->get_price();
        }

        if ( $is_checking_mov ) {
            if ( ! RequirementHelper::is_cart_meet_requirement( $role ) ) {
                return $product->get_price();
            }
        }

        $prices = self::get_price_and_extra( $product, $role );
        if ( ! isset( $prices ) || empty( $prices ) ) {
            return $product->get_price();
        }

        return self::calculate_wholesale_price( $prices['price'], $prices['extra'], $product, $role, $quantity );
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

        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $regular_price = (float) $product->get_regular_price();
        $sale_price    = (float) $product->get_price();
        $price         = ( $apply_to_sale && $sale_price < $regular_price ) ? $sale_price : $regular_price;

        return self::calculate_wholesale_price( $price, 0, $product, $role, 1 );
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
        $prices = $product->get_variation_prices( true );
        if ( ! isset( $prices['price'] ) ) {
            return [];
        }

        // if ( ! RequirementHelper::is_cart_meet_requirement( $role ) ) {
            // return $price;
            // }

        $discounted = [];
        foreach ( $prices['price'] as $vid => $price ) {
            $product      = wc_get_product( $vid );
            $discounted[] = self::get_wholesale_price_for_display( $product, $role );
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
            $product      = wc_get_product( $child_id );
            $discounted[] = self::get_wholesale_price_for_display( $product, $role );
        }
        return $discounted;
    }

    /**
     * Calculate the price after applying the wholesale discount
     *
     * @param float       $price The original price before adding the extra.
     * @param float       $extra The extra price (can be 0, negative, positive).
     * @param \WC_Product $product The current handling product.
     * @param array       $role The wholesale role.
     * @param int         $quantity The quantity of product in cart.
     * @return float The discounted price
     */
    public static function calculate_wholesale_price( $price, $extra, $product, $role, $quantity = 1 ) {
        $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
        if ( $discount < 0 ) {
            return $price;
        }

        $discounted_extra = max( 0, ( $extra ) * ( 1 - $discount ) );

        $discounted_extra = apply_filters( 'ywhs_extra_calculated_before_add_to_price', $discounted_extra );
        $final_price      = 0;

        if ( Utils::is_pro() ) {
            // Pro handle for product based, category based, price tier (INCOMING)
            $handled_price = null;
            if ( isset( $handled_price ) ) {
                $final_price = $handled_price;
            }
        } else {
            // Lite handle (Role based percentage discount)
            $final_price = max( 0, ( $price ) * ( 1 - $discount ) );
        }

        if ( $extra < 0 ) {
            $final_price = $final_price - abs( $extra );
        } else {
            $final_price = $final_price + $discounted_extra;
        }

        return (float) wc_format_decimal( $final_price, wc_get_price_decimals() );
    }

    /**
     * Split the price to original price and extra price
     *
     * @param \WC_Product $product The current handling product.
     * @param array       $role The wholesale role.
     * @return array The prices
     */
    protected static function get_price_and_extra( \WC_Product $product, array $role ) {
        $apply_to_sale = $role['applyToSalePrice'] ?? false;

        $regular_price = $product->get_regular_price();
        $sale_price    = $product->get_price();

        $is_sale_price = ( $apply_to_sale && $sale_price < $regular_price );
        $price         = $is_sale_price ? $sale_price : $regular_price;

        $product = wc_get_product( $product->get_id() );

        if ( $is_sale_price ) {
            $original = $product->get_sale_price();
        } else {
            $original = $product->get_regular_price();
        }

        return [
            'price' => $original,
            'extra' => $price - $original,
        ];
    }
}
