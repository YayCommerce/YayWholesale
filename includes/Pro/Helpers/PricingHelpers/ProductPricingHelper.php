<?php

namespace YayWholesaleB2B\Pro\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * Product Based Pricing Helper
 */
class ProductPricingHelper {


    public const PRODUCT_BASED_DISCOUNT_KEY = 'yaywholesaleb2b_product_based_discount';
    public const PRODUCT_BASED_CSV_CACHED   = 'yaywholesaleb2b_product_pricing_csv';

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

        // Flush Cache
        self::flush_cache_csv();
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
     * @param int   $quantity the in-cart quantity of product.
     * @return array | null
     */
    public static function get_product_based_discount( $product_id, $wholesale_role, $quantity ) {
        if ( ! isset( $wholesale_role ) ) {
            return false;
        }

        $product_based_discount_setting = get_post_meta( $product_id, self::PRODUCT_BASED_DISCOUNT_KEY, true );

        if ( ! is_array( $product_based_discount_setting ) || ( isset( $product_based_discount_setting['discount_rule'] ) && 'default' === $product_based_discount_setting['discount_rule'] ) ) {
            return false;
        }

        $type = $product_based_discount_setting['discount_type'] ?? 'by_role';
        switch ( $type ) {
            case 'by_role':
                $product_by_role = $product_based_discount_setting['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ];
                $type            = $product_by_role['type'];

                if ( 'fixed' === $product_by_role['type'] ) {
                    $product_based_discount = $product_by_role['fixed'];
                    break;
                }

                if ( 'rate' === $product_by_role['type'] ) {
                    $product_based_discount = $product_by_role['rate'];
                }
                break;
            case 'tiered':
                $product_tiered         = $product_based_discount_setting['discount_tiered']['wholesaler'][ $wholesale_role['slug'] ];
                $product_based_discount = $product_tiered['base_tier']['price'];
                $product_tier_list      = $product_tiered['tier_list'];

                foreach ( $product_tier_list as $tier ) {
                    if ( $quantity >= $tier['from'] ) {
                        $product_based_discount = $tier['price'];
                    }
                }

                break;
            default:
                return false;
        }//end switch

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
     * @param int   $quantity The in-cart quantity of product.
     * @return float | bool
     */
    public static function calculate_product_based_price( $price, $product_id, $wholesale_role, $quantity ) {
        $discount = self::get_product_based_discount( $product_id, $wholesale_role, $quantity );
        if ( empty( $discount ) ) {
            return false;
        }

        if ( 'fixed' === $discount['wholesale_discount_type'] || 'tiered' === $discount['wholesale_discount_type'] ) {
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

    public static function get_cached_csv() {
        $cached_csv = get_transient( self::PRODUCT_BASED_CSV_CACHED );
        if ( empty( $cached_csv ) || ! is_file( YAYWHOLESALEB2B_PLUGIN_DIR . $cached_csv ) ) {
            return false;
        }

        return $cached_csv;
    }

    public static function build_csv() {
        $rows = [ self::get_csv_header() ];
        $rows = array_merge( $rows, self::get_csv_products_pricing() );

        $filename    = 'assets/pro/csv/ywhs_product_price_list.csv';
        $cached_dir  = YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/pro/csv';
        $csv_content = '';

        foreach ( $rows as $row ) {
            $escaped      = array_map( fn( $item ) => '"' . $item . '"', $row );
            $csv_content .= implode( ',', $escaped ) . "\n";
        }

        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        if ( ! $wp_filesystem->is_dir( $cached_dir ) ) {
            $wp_filesystem->mkdir( $cached_dir );
        }

        $wp_filesystem->put_contents( YAYWHOLESALEB2B_PLUGIN_DIR . $filename, $csv_content, FS_CHMOD_FILE );
        set_transient( self::PRODUCT_BASED_CSV_CACHED, $filename, 24 * 60 * 60 );
        return $filename;
    }

    protected static function get_csv_header() {
        $headers = [
            __( 'Product / Variation ID', 'yay-wholesale-b2b' ),
            __( 'Product / Variation Name & SKU', 'yay-wholesale-b2b' ),
            __( 'Regular Price', 'yay-wholesale-b2b' ),
            __( 'Sale Price', 'yay-wholesale-b2b' ),
        ];

        $roles = RolesHelper::get_wholesale_roles();
        foreach ( $roles as $role ) {
            $role_headers = [
                $role['slug'] . ': ' . $role['name'] . __( ' discount type', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' fixed price', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' percentage', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' tier', 'yay-wholesale-b2b' ),
            ];
            $headers      = array_merge( $headers, $role_headers );
        }

        return $headers;
    }

    protected static function get_csv_products_pricing() {
        $products = wc_get_products(
            [
                'limit'                  => -1,
                'status'                 => 'publish',
                'type'                   => array_merge( self::get_allowed_product_types_for_display_setting(), [ 'variable' ] ),
                'update_post_meta_cache' => true,
            ]
        );

        $rows  = [];
        $queue = $products;

        while ( ! empty( $queue ) ) {
            $product = array_shift( $queue );
            if ( $product->is_type( 'variable' ) ) {

                $queue = array_merge(
                    $queue,
                    array_map( 'wc_get_product', $product->get_children() )
                    // wc_get_products(
                    // [
                    // 'include'                => $product->get_children(),
                    // 'type'                   => 'product_variation',
                    // 'limit'                  => -1,
                    // 'update_post_meta_cache' => true,
                    // ]
                    // )
                );
                continue;
            }//end if
            $row = [
                $product->get_id(),
                $product->get_name() . ' (SKU: ' . $product->get_sku() . ' )',
                $product->get_regular_price(),
                $product->get_sale_price() ?? '',
            ];

            $pricing                = self::get_product_based_discount_setting( $product->get_id() );
            $roles                  = RolesHelper::get_wholesale_roles();
            $discount_rule          = $pricing['discount_rule'];
            $discount_type          = $pricing['discount_type'];
            $wholesalers_fixed_rate = $pricing['discount_by_role']['wholesaler'];
            $wholesalers_tier       = $pricing['discount_tiered']['wholesaler'];

            // Handle by role
            foreach ( $roles as $role ) {
                $slug = $role['slug'];
                if ( array_key_exists( $slug, $wholesalers_fixed_rate ) ) {
                    $type  = $wholesalers_fixed_rate[ $slug ]['type'];
                    $fixed = $wholesalers_fixed_rate[ $slug ]['fixed'];
                    $rate  = $wholesalers_fixed_rate[ $slug ]['rate'];
                } else {
                    $type  = 'fixed';
                    $fixed = '';
                    $rate  = '';
                }

                if ( $discount_rule === 'default' ) {
                    $type = 'default';
                } elseif ( $discount_type === 'tiered' ) {
                    $type = 'tiered';
                }

                if ( array_key_exists( $slug, $wholesalers_tier ) ) {
                    $tier_str  = '0:' . $wholesalers_tier[ $slug ]['base_tier']['price'] . ';';
                    $tier_str .= implode( ';', array_map( fn( $tier ) => $tier['from'] . ':' . $tier['price'], $wholesalers_tier[ $slug ]['tier_list'] ) );
                } else {
                    $tier_str = '';
                }

                $row = array_merge(
                    $row,
                    [
                        $type,
                        $fixed,
                        $rate,
                        $tier_str,
                    ]
                );
            }//end foreach

            $rows[] = $row;
        }//end while

        return $rows;
    }

    public static function flush_cache_csv() {
        $filename = get_transient( self::PRODUCT_BASED_CSV_CACHED );

        if ( $filename ) {
            delete_transient( self::PRODUCT_BASED_CSV_CACHED );
            wp_delete_file( YAYWHOLESALEB2B_PLUGIN_DIR . $filename );
        }
    }
}
