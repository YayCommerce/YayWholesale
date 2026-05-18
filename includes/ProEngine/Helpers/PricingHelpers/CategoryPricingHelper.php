<?php

namespace YayWholesaleB2B\ProEngine\Helpers\PricingHelpers;

/**
 * Category Based Pricing Helper
 */
class CategoryPricingHelper {

    public const CATEGORY_BASED_DISCOUNT_KEY = 'yaywholesaleb2b_category_based_discount';

    /**
     * Convert the data to save from the post data sent
     *
     * @param array $wholesale_roles The list of wholesale roles.
     * @param array $post_data The post data (currently $_POST).
     * @return array
     */
    public static function handle_category_based_discount_data_from_post( $wholesale_roles, $post_data ) {
        $discount_data = [];

        // Discount mode: default (turn off) | custom (turn on)
        if ( ! empty( $post_data['ywhs_category_based_discount_mode'] ) ) {
            $discount_data['discount_mode'] = $post_data['ywhs_category_based_discount_mode'];
        } else {
            $discount_data['discount_mode'] = 'default';
        }

        foreach ( $wholesale_roles as $role ) {
            $slug = $role['slug'];

            // Percentage category based pricing
            if ( ! empty( $post_data[ "ywhs_category_based_rate_$slug" ] ) ) {
                $discount_rate = $post_data[ "ywhs_category_based_rate_$slug" ];
            } else {
                $discount_rate = '';
            }

            $discount_data['discount_rate'][ $slug ] = $discount_rate;
        }//end foreach

        return $discount_data;
    }

    /**
     * Save category-based setting for category
     *
     * @param int   $term_id The category id.
     * @param array $data The setting.
     */
    public static function save_category_based_discount( int $term_id, $data ) {
        update_term_meta( $term_id, 'yaywholesaleb2b_category_based_discount', $data );
    }

    /**
     * Get the category based discount data
     *
     * @param int|\WC_Product $product The current product.
     * @param array           $wholesale_role The list of wholesale roles.
     * @return array | null
     */
    public static function get_category_based_discount( $product, $wholesale_role ) {
        if ( is_int( $product ) ) {
            $product = wc_get_product( $product );
        }

        $category_ids = $product->get_category_ids();
        $discounts    = [];
        foreach ( $category_ids as $cat_id ) {
            $cat_discount = get_term_meta( $cat_id, self::CATEGORY_BASED_DISCOUNT_KEY, true );

            if ( $cat_discount &&
                'custom' === $cat_discount['discount_mode'] &&
                ! empty( $cat_discount['discount_rate'][ $wholesale_role['slug'] ] ) ) {
                $discounts[ $cat_id ] = $cat_discount['discount_rate'][ $wholesale_role['slug'] ];
                continue;
            }

            $ancestor_cat_ids = get_ancestors( $cat_id, 'product_cat', 'taxonomy' );

            foreach ( $ancestor_cat_ids as $ancestor_cat_id ) {
                $cat_discount = get_term_meta( $ancestor_cat_id, self::CATEGORY_BASED_DISCOUNT_KEY, true );

                // only take discount from the first parent has discount
                if ( $cat_discount &&
                    'custom' === $cat_discount['discount_mode'] &&
                    ! empty( $cat_discount['discount_rate'][ $wholesale_role['slug'] ] )
                ) {
                    $discounts[ $cat_id ] = $cat_discount['discount_rate'][ $wholesale_role['slug'] ];
                    break;
                }
            }
        }//end foreach

        return count( $discounts ) === 0 ? null : [
            'wholesale_discount_type'  => 'rate',
            'wholesale_discount_value' => max( $discounts ),
        ];
    }

    /**
     * Get category-based price calculated
     *
     * @param float       $price The product price.
     * @param \WC_Product $product The current handling product.
     * @param array       $wholesale_role The wholesale role.
     * @return float | bool
     */
    public static function calculate_category_based_price( $price, $product, $wholesale_role ) {
        $discount_data = self::get_category_based_discount( $product, $wholesale_role );
        if ( empty( $discount_data ) ) {
            return false;
        }

        return max( 0, $price * ( 1 - $discount_data['wholesale_discount_value'] / 100 ) );
    }
}
