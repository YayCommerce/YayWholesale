<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

/**
 * Shop Pricing Helper
 */
class ShopPricingHelper {

    public const WHOLESALE_ORIGINAL_PRICE_KEY = 'ywhs_wholesale_original_price';
    public const WHOLESALE_EXTRA_PRICE_KEY    = 'ywhs_wholesale_extra_price';

    public static function  get_cart_item_wholesale_price( &$cart_item, $role_config, $quantity ) {
        $product = wc_get_product( $cart_item['data']->get_id() );

        $prices          = self::get_price_and_extra( $cart_item, $role_config );
        $wholesale_price = ProductPricingHelper::get_wholesale_price( $product, $role_config, $quantity );

        $extra_price     = $prices['extra_price'];
        $wholesale_extra = self::calculate_wholesale_discount_for_extra( $extra_price, $role_config );

        $final_price = max( 0, $wholesale_price + $wholesale_extra );

        $cart_item[ self::WHOLESALE_ORIGINAL_PRICE_KEY ] = $wholesale_price;
        $cart_item[ self::WHOLESALE_EXTRA_PRICE_KEY ]    = $wholesale_extra;

        return $final_price;
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

        $discounted = (float) wc_format_decimal( $discounted, wc_get_price_decimals() );

        return apply_filters( 'ywhs_price_handle_processed', $discounted, $product );
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
     * Split the price to original price and extra price
     *
     * @param array $cart_item The current handling product.
     * @param array $role The wholesale role.
     * @return array The prices
     */
    protected static function get_price_and_extra( array $cart_item, array $role ) {
        if ( isset( $cart_item[ self::WHOLESALE_ORIGINAL_PRICE_KEY ] ) && isset( $cart_item[ self::WHOLESALE_EXTRA_PRICE_KEY ] ) ) {
            $original = (float) $cart_item[ self::WHOLESALE_ORIGINAL_PRICE_KEY ];
            $extra    = (float) $cart_item[ self::WHOLESALE_EXTRA_PRICE_KEY ];
        } else {

            $apply_to_sale = $role['applyToSalePrice'] ?? false;

            $regular_price = (float) $cart_item['data']->get_regular_price();
            $sale_price    = (float) $cart_item['data']->get_price();

            $is_sale_price = ( $apply_to_sale && $sale_price < $regular_price );
            $price         = $is_sale_price ? $sale_price : $regular_price;

            $product = wc_get_product( $cart_item['data']->get_id() );

            if ( $is_sale_price ) {
                $original = (float) $product->get_price();
            } else {
                $original = (float) $product->get_regular_price();
            }

            $extra = $price - $original;
        }//end if

        return [
            'original_price' => $original,
            'extra_price'    => $extra,
        ];
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

        $extra_price = apply_filters( 'ywhs_extra_price_before_apply_wholesale_discount', $extra_price, $role_config );

        if ( $extra_price < 0 ) {
            return $extra_price;
        }

        $discounted_extra = max( 0, ( $extra_price ) * ( 1 - $discount ) );

        return wc_format_decimal( $discounted_extra, wc_get_price_decimals() );
    }
}
