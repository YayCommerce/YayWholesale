<?php

namespace YayWholesaleB2B\Pro\Helpers\AccessHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;

/**
 * Category Based Access Helper
 */
class CategoryAccessHelper {
    const ACCESS_KEY = 'yaywholesaleb2b_cat_access';

    /**
     * Convert the data to save from the post data sent
     *
     * @param  array $wholesale_roles The list of wholesale roles.
     * @param  array $post_data       The post data (currently $_POST).
     * @return array
     */
    public static function handle_category_based_access_restriction_from_post( $wholesale_roles, $post_data ) {
        $discount_data = [];

        // Access rule: visible-all | visible-specific-role
        if ( isset( $post_data['access-rule'] ) ) {
            $discount_data['rule'] = $post_data['access-rule'];
        } else {
            $discount_data['rule'] = 'visible-all';
        }

        // Access rule for retailers
        if ( isset( $post_data['access-retailers'] ) ) {
            $discount_data['retailers'] = $post_data['access-retailers'];
        } else {
            $discount_data['retailers'] = 'disabled';
        }

        // Access rule for wholesalers
        if ( isset( $post_data['access-wholesalers'] ) ) {
            $discount_data['wholesalers'] = $post_data['access-wholesalers'];
        } else {
            $discount_data['wholesalers'] = 'disabled';
        }

        $discount_data['selected_roles'] = [];
        if ( 'enabled-selected-roles' === $discount_data['wholesalers'] ) {
            foreach ( $wholesale_roles as $role ) {
                $slug = $role['slug'];

                // Fixed category based pricing
                if ( ! empty( $post_data['access-selected-roles'][ $slug ] ) ) {
                    $discount_data['selected_roles'][] = $slug;
                }
            }//end foreach

            if ( empty( $discount_data['selected_roles'] ) ) {
                $discount_data['wholesalers']    = 'disabled';
                $discount_data['selected_roles'] = [];
            }

            if ( count( $discount_data['selected_roles'] ) === count( $wholesale_roles ) ) {
                $discount_data['wholesalers']    = 'enabled';
                $discount_data['selected_roles'] = [];
            }
        }//end if

        if ( 'enabled' === $discount_data['retailers'] && 'enabled' === $discount_data['wholesalers'] ) {
            $discount_data['rule'] = 'visible-all';
        }

        return $discount_data;
    }

    /**
     * Save category-based setting for category.
     *
     * @param int   $term_id The term id.
     * @param array $data The setting.
     */
    public static function save_category_based_access_restriction( int $term_id, $data ) {
        update_term_meta( $term_id, self::ACCESS_KEY, $data );
    }

    public static function get_category_based_access_restriction( int $term_id ) {
        $data = get_term_meta( $term_id, self::ACCESS_KEY, true );
        return empty( $data ) ? self::get_default_settings() : $data;
    }

    public static function is_accessible_category( int $term_id, array $wholesale_role ) {
        $access_data = self::get_category_based_access_restriction( $term_id );
        if ( empty( $access_data ) || 'visible-all' === $access_data['rule'] ) {
            return true;
        }

        if ( $wholesale_role !== null ) {
            if ( 'disabled' === $access_data['wholesalers'] ) {
                return false;
            }

            if ( 'enabled' === $access_data['wholesalers'] || in_array( $wholesale_role['slug'], $access_data['selected_roles'], true ) ) {
                return true;
            }
        } else {
            if ( 'disabled' === $access_data['retailers'] ) {
                return false;
            }

            if ( 'enabled' === $access_data['retailers'] ) {
                return true;
            }
        }//end if

        return false;
    }

    public static function is_accessible_product_by_categories( \WC_Product $product, array $wholesale_role ) {
        $product_categories = wp_get_post_terms( $product->get_id(), 'product_cat' );

        $filtered_product_categories = self::filter_accessible_categories( $product_categories, $wholesale_role );
        return ! empty( $filtered_product_categories );
    }

    public static function filter_accessible_categories( array $categories, array $wholesale_role ) {
        $blocked_ids = [];
        foreach ( $categories as $cat ) {
            if ( $cat->taxonomy === 'product_cat' ) {
                if ( ! in_array( $cat->term_id, $blocked_ids, true ) && ! self::is_accessible_category( $cat->term_id, $wholesale_role ) ) {
                    $blocked_ids[] = $cat->term_id;
                }
                if ( ! empty( $cat->parent ) && ! in_array( $cat->parent, $blocked_ids, true ) && ! self::is_accessible_category( $cat->parent, $wholesale_role ) ) {
                    $blocked_ids[] = $cat->parent;
                }
            }
        }

        return array_filter( $categories, fn( $value ) => ! in_array( $value->term_id, $blocked_ids, true ) && ! in_array( $value->parent, $blocked_ids, true ) );
    }

    public static function get_default_settings() {
        return [
            'rule'           => 'visible-all',
            'retailers'      => 'enabled',
            'wholesalers'    => 'enabled',
            'selected_roles' => [],
        ];
    }
}
