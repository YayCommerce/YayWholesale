<?php

namespace YayWholesaleB2B\Pro\Helpers\PricingHelpers;

/**
 * Product Based Pricing Helper
 */
class ProductPricingHelper {


    public const PRODUCT_BASED_DISCOUNT_KEY = 'yaywholesaleb2b_product_based_discount';

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
     * @param int      $product_id The product id.
     * @param  array    $wholesale_roles The list of wholesale roles.
     * @param  array    $post_data       The post data (currently $_POST).
     * @param  int|null $variation_index The index of variation.
     * @return array
     */
    public static function handle_product_based_discount_data_from_post( $product_id, $wholesale_roles, $post_data, $variation_index = null ) {
        $discount_data = self::get_product_based_discount_setting( $product_id );
        $prefix        = isset( $variation_index ) ? "-$variation_index" : '';

        // Discount mode: default (turn off) | custom (turn on)
        if ( isset( $post_data[ "discount-rule{$prefix}" ] ) ) {
            $discount_data['discount_rule'] = $post_data[ "discount-rule{$prefix}" ];
        } else {
            $discount_data['discount_rule'] = 'default';
        }

        // Discount Rule: by_role | tiers (incomming)
        if ( isset( $post_data[ "discount-type{$prefix}" ] ) ) {
            $discount_data['discount_type'] = $post_data[ "discount-type{$prefix}" ];
        } else {
            $discount_data['discount_rule'] = 'default';
            $discount_data['discount_type'] = 'by_role';
        }

        foreach ( $wholesale_roles as $role ) {
            $slug = $role['slug'];

            if ( ! empty( $post_data[ "discount-by-role-types$prefix" ][ $slug ] ) ) {
                $discount_type = $post_data[ "discount-by-role-types$prefix" ][ $slug ];
            } else {
                $discount_type = 'fixed';
            }

            if ( ! empty( $post_data[ "discount-by-role-val$prefix" ][ $slug ] ) ) {
                $discount_value = $post_data[ "discount-by-role-val$prefix" ][ $slug ];
            } else {
                $discount_value = '';
            }

            $discount_data['discount_by_role']['wholesaler'][ $slug ]['type'] = $discount_type;
            if ( 'fixed' === $discount_type ) {
                $discount_data['discount_by_role']['wholesaler'][ $slug ]['fixed'] = $discount_value;
            }

            if ( 'rate' === $discount_type ) {
                $discount_data['discount_by_role']['wholesaler'][ $slug ]['rate'] = $discount_value;
            }

            // Tier
            if ( ! empty( $post_data[ "base-tier-price$prefix" ][ $slug ] ) ) {
                $base_tier_price = $post_data[ "base-tier-price$prefix" ][ $slug ];
            } else {
                $base_tier_price = '';
            }
            $discount_data['discount_tiered']['wholesaler'][ $slug ]['base_tier']['price'] = $base_tier_price;
            $discount_data['discount_tiered']['wholesaler'][ $slug ]['tier_list']          = [];

            if ( ! empty( $post_data[ "tier-from-quantity$prefix" ][ $slug ] ) && is_array( $post_data[ "tier-from-quantity$prefix" ][ $slug ] ) ) {
                foreach ( $post_data[ "tier-from-quantity$prefix" ][ $slug ] as $index => $quantity ) {
                    if ( $quantity > 0 ) {
                        $new_tier = [
                            'from'  => $quantity,
                            'price' => $post_data[ "tier-price$prefix" ][ $slug ][ $index ],
                        ];

                        $discount_data['discount_tiered']['wholesaler'][ $slug ]['tier_list'][] = $new_tier;
                    }
                }

                usort( $discount_data['discount_tiered']['wholesaler'][ $slug ]['tier_list'], fn( $a, $b ) => $a['from'] <=> $b['from'] );
            }
        }//end foreach

        return $discount_data;
    }

    /**
     * Save product-based setting for product / variation
     *
     * @param int   $product_id The product id.
     * @param array $data The setting.
     */
    public static function save_product_based_discount_setting( int $product_id, $data ) {
        update_post_meta( $product_id, self::PRODUCT_BASED_DISCOUNT_KEY, $data );
    }

    /**
     * Get product-based setting for product / variation
     *
     * @param int $product_id The product id.
     */
    public static function get_product_based_discount_setting( int $product_id ) {
        $setting = get_post_meta( $product_id, self::PRODUCT_BASED_DISCOUNT_KEY, true );
        return array_replace_recursive( self::get_default_settings(), ! empty( $setting ) ? $setting : [] );
    }

    /**
     * Get the Product based discount data
     *
     * @param int   $product_id The product id.
     * @param array $wholesale_role The list of wholesale roles.
     * @return array | null
     */
    public static function get_product_based_discount( $product_id, $wholesale_role ) {
        if ( ! isset( $wholesale_role ) ) {
            return false;
        }

        $product_based_discount_setting = get_post_meta( $product_id, self::PRODUCT_BASED_DISCOUNT_KEY, true );

        if ( ! is_array( $product_based_discount_setting ) || ( isset( $product_based_discount_setting['discount_rule'] ) && 'default' === $product_based_discount_setting['discount_rule'] ) ) {
            return false;
        }

        $type = $product_based_discount_setting['discount_type'] ?? 'fixed';

        switch ( $type ) {
            case 'fixed':
                $product_based_discount = $product_based_discount_setting['discount_fixed'][ $wholesale_role['slug'] ] ?? 0;
                break;
            case 'rate':
                $product_based_discount = $product_based_discount_setting['discount_rates'][ $wholesale_role['slug'] ] ?? 0;
                break;
            default:
                return false;
        }

        if ( empty( $product_based_discount ) ) {
            return false;
        }

        return [
            'wholesale_discount_type'  => $type,
            'wholesale_discount_value' => (float) $product_based_discount,
        ];
    }

    /**
     * Get product-based price calculated
     *
     * @param float $price The product price.
     * @param int   $product_id The current handling product ID.
     * @param array $wholesale_role The wholesale role.
     * @return float | bool
     */
    public static function calculate_product_based_price( $price, $product_id, $wholesale_role ) {
        $discount = self::get_product_based_discount( $product_id, $wholesale_role );
        if ( empty( $discount ) ) {
            return false;
        }

        if ( 'fixed' === $discount['wholesale_discount_type'] ) {
            return $discount['wholesale_discount_value'];
        }

        if ( 'rate' === $discount['wholesale_discount_type'] ) {
            return max( 0, $price * ( 1 - $discount['wholesale_discount_value'] / 100 ) );
        }

        return false;
    }

    public static function get_default_settings() {
        return [
            'discount_rule'    => 'default',
            'discount_type'    => 'by_role',
            'discount_by_role' => [
                'wholesaler' => [],
            ],
            'discount_tiered'  => [
                'wholesaler' => [],
            ],
        ];
    }
}
