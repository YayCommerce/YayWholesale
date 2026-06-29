<?php

namespace YayWholesaleB2B\Pro\Helpers\AccessHelpers;

/**
 * Product Based Access Helper
 */
class ProductAccessHelper {
    public const PRODUCT_BASED_ACCESS_KEY = 'yaywholesaleb2b_product_based_access';

    /**
     * Convert the data to save from the post data sent
     *
     * @param  array    $wholesale_roles The list of wholesale roles.
     * @param  array    $post_data       The post data (currently $_POST).
     * @param  int|null $variation_index The index of variation.
     * @return array
     */
    public static function handle_product_based_access_restriction_from_post( $wholesale_roles, $post_data, $variation_index = null ) {
        $discount_data = [];
        $prefix        = isset( $variation_index ) ? "-$variation_index" : '';

        // Access rule: visible-all | visible-specific-role
        if ( isset( $post_data[ "access-rule{$prefix}" ] ) ) {
            $discount_data['rule'] = $post_data[ "access-rule{$prefix}" ];
        } else {
            $discount_data['rule'] = 'visible-all';
        }

        // Access rule for retailers
        if ( isset( $post_data[ "access-retailers{$prefix}" ] ) ) {
            $discount_data['retailers'] = $post_data[ "access-retailers{$prefix}" ];
        } else {
            $discount_data['retailers'] = 'disabled';
        }

        // Access rule for wholesalers
        if ( isset( $post_data[ "access-wholesalers{$prefix}" ] ) ) {
            $discount_data['wholesalers'] = $post_data[ "access-wholesalers{$prefix}" ];
        } else {
            $discount_data['wholesalers'] = 'disabled';
        }

        $discount_data['selected_roles'] = [];
        if ( 'enabled-selected-roles' === $discount_data['wholesalers'] ) {
            foreach ( $wholesale_roles as $role ) {
                $slug = $role['slug'];

                // Fixed product based pricing
                if ( ! empty( $post_data[ "access-selected-roles$prefix" ][ $slug ] ) ) {
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
     * Save product-based setting for product / variation
     *
     * @param int   $product_id The product id.
     * @param array $data The setting.
     */
    public static function save_product_based_access_restriction( int $product_id, $data ) {
        update_post_meta( $product_id, self::PRODUCT_BASED_ACCESS_KEY, $data );
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
