<?php

namespace YayWholesaleB2B\ProEngine\Helpers\PricingHelpers;

/**
 * Product Based Pricing Helper
 */
class ProductPricingHelper {

    /**
     * Get the allowed product types for displaying setting on editing single product page
     */
    public static function get_allowed_product_types_for_display_setting() {
        $allowed = [ 'simple', 'subscription', 'subscription_variation', 'external', 'bundle' ];

        return apply_filters( 'ywhs_allowed_type_for_single_product_based_discount', $allowed );
    }


    /**
     * Convert the data to save from the post data sent
     *
     * @param array    $wholesale_roles The list of wholesale roles.
     * @param array    $post_data The post data (currently $_POST).
     * @param int|null $variation_index The index of variation.
     * @return array
     */
    public static function handle_product_based_discount_data_from_post( $wholesale_roles, $post_data, $variation_index = null ) {
        $discount_data = [];

        foreach ( $wholesale_roles as $role ) {
            $slug   = $role['slug'];
            $prefix = isset( $variation_index ) ? "{$slug}_{$variation_index}" : $slug;

            // Discount mode: default (turn off) | custom (turn on)
            if ( isset( $post_data[ "ywhs_discount_mode_$prefix" ] ) ) {
                $discount_mode = $post_data[ "ywhs_discount_mode_$prefix" ];
            } else {
                $discount_mode = 'default';
            }

            // Discount Rule: rate | fixed | tiers (incomming)
            if ( isset( $post_data[ "ywhs_discount_rule_$prefix" ] ) ) {
                $discount_rule = $post_data[ "ywhs_discount_rule_$prefix" ];
            } else {
                $discount_mode = 'default';
                $discount_rule = 'fixed';
            }

            // Fixed product based pricing
            if ( isset( $post_data[ "ywhs_fixed_price_$prefix" ] ) ) {
                $discount_fixed = (float) $post_data[ "ywhs_fixed_price_$prefix" ];
            } else {
                $discount_fixed = 0;
            }

            // Percentage product based pricing
            if ( isset( $post_data[ "ywhs_rate_price_$prefix" ] ) ) {
                $discount_rate = (float) $post_data[ "ywhs_rate_price_$prefix" ];
            } else {
                $discount_rate = 0;
            }

            $discount_data[ $slug ] = [
                'discount_mode'  => $discount_mode,
                'discount_rule'  => $discount_rule,
                'discount_fixed' => $discount_fixed,
                'discount_rate'  => $discount_rate,
            ];
        }//end foreach
        return $discount_data;
    }
}
