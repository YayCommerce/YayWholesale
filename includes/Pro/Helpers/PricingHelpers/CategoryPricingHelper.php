<?php

namespace YayWholesaleB2B\Pro\Helpers\PricingHelpers;

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
        if ( ! empty( $post_data['discount-rule'] ) ) {
            $discount_data['discount_rule'] = $post_data['discount-rule'];
        } else {
            $discount_data['discount_rule'] = 'default';
        }

        foreach ( $wholesale_roles as $role ) {
            $slug = $role['slug'];

            // Percentage category based pricing
            if ( ! empty( $post_data['discount-rates'][ $slug ] ) ) {
                $discount_rate = $post_data['discount-rates'][ $slug ];
            } else {
                $discount_rate = '';
            }

            $discount_data['discount_rates'][ $slug ] = $discount_rate;
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
        if ( ! isset( $wholesale_role ) ) {
            return false;
        }

        if ( is_int( $product ) ) {
            $product = wc_get_product( $product );
        }

        // If this is a variant product then use parent product's categories
        if ( $product->get_type() === 'variation' ) {
            $parent_id = $product->get_parent_id();
            if ( ! empty( $parent_id ) ) {
                $product = wc_get_product( $parent_id );
            }
        }

        $category_ids = $product->get_category_ids();
        $discounts    = [];
        foreach ( $category_ids as $cat_id ) {
            $cat_discount = get_term_meta( $cat_id, self::CATEGORY_BASED_DISCOUNT_KEY, true );
            $rule         = $cat_discount['discount_rule'] ?? 'default';

            if ( $cat_discount &&
                'custom' === $rule &&
                ! empty( $cat_discount['discount_rates'][ $wholesale_role['slug'] ] ) ) {
                $discounts[ $cat_id ] = $cat_discount['discount_rates'][ $wholesale_role['slug'] ];
                continue;
            }

            $ancestor_cat_ids = get_ancestors( $cat_id, 'product_cat', 'taxonomy' );

            foreach ( $ancestor_cat_ids as $ancestor_cat_id ) {
                $cat_discount = get_term_meta( $ancestor_cat_id, self::CATEGORY_BASED_DISCOUNT_KEY, true );
                $rule         = $cat_discount['discount_rule'] ?? 'default';

                // only take discount from the first parent has discount
                if ( $cat_discount &&
                    'custom' === $rule &&
                    ! empty( $cat_discount['discount_rates'][ $wholesale_role['slug'] ] )
                ) {
                    $discounts[ $cat_id ] = $cat_discount['discount_rates'][ $wholesale_role['slug'] ];
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

    /**
     * Get category-based setting of term
     *
     * @param int $term_id The term id.
     */
    public static function get_category_based_discount_setting( int $term_id ) {
        $setting = get_term_meta( $term_id, self::CATEGORY_BASED_DISCOUNT_KEY, true );
        return array_replace_recursive( self::get_default_settings(), ! empty( $setting ) ? $setting : [] );
    }

    public static function get_default_settings() {
        return [
            'discount_rule'  => 'default',
            'discount_rates' => [],
        ];
    }
}
