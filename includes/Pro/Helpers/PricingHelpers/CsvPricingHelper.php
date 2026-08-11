<?php

namespace YayWholesaleB2B\Pro\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * CSV Product Based Pricing Helper
 */
class CsvPricingHelper {

    public const PRODUCT_BASED_CSV_CACHED = 'yaywholesaleb2b_product_pricing_csv';

    // EXPORT HANDLER
    /**
     * Get the pricing csv from cache
     *
     * @return string|false
     */
    public static function get_cached_csv() {
        $cached_csv = get_transient( self::PRODUCT_BASED_CSV_CACHED );
        if ( empty( $cached_csv ) || ! is_file( YAYWHOLESALEB2B_PLUGIN_DIR . $cached_csv ) ) {
            return false;
        }

        return $cached_csv;
    }

    /**
     * Build a csv file for export pricing
     *
     * @return string filepath
     */
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

    /**
     * Build csv file headers
     *
     * @return array
     */
    protected static function get_csv_header() {
        $headers = [
            __( 'Product / Variation ID', 'yay-wholesale-b2b' ),
            __( 'Product / Variation Name & SKU', 'yay-wholesale-b2b' ),
            __( 'Regular Price', 'yay-wholesale-b2b' ),
            __( 'Sale Price', 'yay-wholesale-b2b' ),
            __( 'Discount Rule', 'yay-wholesale-b2b' ),
        ];

        $roles = RolesHelper::get_wholesale_roles();
        foreach ( $roles as $role ) {
            $role_headers = [
                $role['slug'] . ': ' . $role['name'] . __( ' fixed or percentage type', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' fixed price', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' percentage', 'yay-wholesale-b2b' ),
                $role['slug'] . ': ' . $role['name'] . __( ' tier', 'yay-wholesale-b2b' ),
            ];
            $headers      = array_merge( $headers, $role_headers );
        }

        return $headers;
    }

    /**
     * Build csv file content (product pricing)
     *
     * @return array
     */
    protected static function get_csv_products_pricing() {
        $products = wc_get_products(
            [
                'limit'                  => -1,
                'status'                 => 'publish',
                'type'                   => array_merge( ProductPricingHelper::get_allowed_product_types_for_display_setting(), [ 'variable' ] ),
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
                );
                continue;
            }//end if

            $pricing                = ProductPricingHelper::get_product_based_discount_setting( $product->get_id() );
            $roles                  = RolesHelper::get_wholesale_roles();
            $discount_rule          = $pricing['discount_rule'] ?? 'default';
            $discount_type          = ! isset( $pricing['discount_type'] ) || $pricing['discount_type'] === 'by_role' ? 'fixed_percentage' : 'tier';
            $wholesalers_fixed_rate = $pricing['discount_by_role']['wholesaler'];
            $wholesalers_tier       = $pricing['discount_tiered']['wholesaler'];

            $row = [
                $product->get_id(),
                $product->get_name() . ' (SKU: ' . $product->get_sku() . ' )',
                $product->get_regular_price(),
                $product->get_sale_price() ?? '',
                $discount_rule === 'custom' ? $discount_type : $discount_rule,
            ];

            // Handle by role
            foreach ( $roles as $role ) {
                $slug = $role['slug'];
                if ( array_key_exists( $slug, $wholesalers_fixed_rate ) ) {
                    $type  = $wholesalers_fixed_rate[ $slug ]['type'] === 'rate' ? 'percentage' : 'fixed';
                    $fixed = $wholesalers_fixed_rate[ $slug ]['fixed'];
                    $rate  = $wholesalers_fixed_rate[ $slug ]['rate'];
                } else {
                    $type  = 'fixed';
                    $fixed = '';
                    $rate  = '';
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

    /**
     * Clear pricing csv cache and file
     */
    public static function flush_cache_csv() {
        $filename = get_transient( self::PRODUCT_BASED_CSV_CACHED );

        if ( $filename ) {
            delete_transient( self::PRODUCT_BASED_CSV_CACHED );
            wp_delete_file( YAYWHOLESALEB2B_PLUGIN_DIR . $filename );
        }
    }

    // IMPORT HANDLER
    /**
     * Import pricing csv to products
     *
     * @param string $filepath The full file path (usually in temp folder of server).
     * @return array logs
     */
    public static function import_csv( string $filepath ) {
        $logs = [];

        if ( ! file_exists( $filepath ) ) {
            $logs[] = __( 'The csv file is not found.', 'yay-wholesale-b2b' );
            return $logs;
        }

        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $csv_content = $wp_filesystem->get_contents( $filepath );

        if ( false === $csv_content ) {
            $logs[] = __( 'Unable to read the csv file.', 'yay-wholesale-b2b' );
            return $logs;
        }

        $rows    = array_map( fn( $row ) => str_getcsv( $row, ',', '"', '\\' ), preg_split( "/\r\n|\n|\r/", $csv_content ) );
        $headers = array_shift( $rows );
        $mapping = self::operate_header( $headers );

        $product_ids = array_filter(
            array_map( 'absint', array_column( $rows, $mapping['id'] ) )
        );

        $products = [];

        if ( ! empty( $product_ids ) ) {
            $query = new \WP_Query(
                [
                    'post_type'              => [ 'product', 'product_variation' ],
                    'post_status'            => 'any',
                    'posts_per_page'         => -1,
                    'post__in'               => $product_ids,
                    'fields'                 => 'ids',
                    'update_post_meta_cache' => true,
                ]
            );

            $products = array_map( 'wc_get_product', $query->posts );
        }

        $import_data = [];

        foreach ( $rows as $index => $row ) {
            if ( empty( $row ) ) {
                // translators: %d: the error row number
                $logs[] = sprintf( __( 'Line %d : Empty row detected.', 'yay-wholesale-b2b' ), $index + 2 );
                continue;
            }

            if ( count( $row ) !== count( $mapping ) ) {
                // translators: %d: the error row number
                $logs[] = sprintf( __( 'Line %d : The data row does not match the expected mapping.', 'yay-wholesale-b2b' ), $index + 2 );
                continue;
            }

            $product = array_filter( $products, fn( $p ) => $p->get_id() === intval( $row[ $mapping['id'] ] ) );

            if ( empty( $product ) ) {
                // translators: %d: the error row number
                $logs[] = sprintf( __( 'Line %d : This product is not found.', 'yay-wholesale-b2b' ), $index + 2 );
                continue;
            }

            $import_data[] = self::operate_pricing( $row, $mapping );
        }//end foreach

        if ( ! empty( $import_data ) ) {
            $result = self::bulk_update_pricing( $import_data );
            if ( $result ) {
                $logs[] = __( 'Pricing imported successfully', 'yay-wholesale-b2b' );
            } else {
                $logs[] = __( 'Pricing imported failed', 'yay-wholesale-b2b' );
            }
        } else {
            $logs[] = __( 'Invalid Import Data', 'yay-wholesale-b2b' );
        }

        do_action( 'ywhs_after_imported_pricing', $import_data, $logs );

        return $logs;
    }

    /**
     * Operate to get the mapping array for data rows (if the row is empty, then use the default mapping)
     *
     * @param array $row the header row.
     * @return array
     */
    protected static function operate_header( array $row ) {
        $mapping = [
            'id'            => 0,
            'product_name'  => 1,
            'regular_price' => 2,
            'sale_price'    => 3,
            'discount_type' => 4,
        ];

        if ( count( $row ) > 5 ) {
            $current_role_slug = '';
            foreach ( $row as $index => $col ) {
                if ( $index < 5 ) {
                    continue;
                }

                switch ( ( $index - 1 ) % 4 ) {
                    case 0:
                        $header_role_map   = explode( ':', $col );
                        $current_role_slug = $header_role_map[ array_key_first( $header_role_map ) ] ?? '';
                        if ( ! empty( $current_role_slug ) ) {
                            $mapping[ "{$current_role_slug}_type" ] = $index;
                        }
                        break;
                    case 1:
                        if ( ! empty( $current_role_slug ) ) {
                            $mapping[ "{$current_role_slug}_fixed" ] = $index;
                        }
                        break;
                    case 2:
                        if ( ! empty( $current_role_slug ) ) {
                            $mapping[ "{$current_role_slug}_rate" ] = $index;
                        }
                        break;
                    case 3:
                        if ( ! empty( $current_role_slug ) ) {
                            $mapping[ "{$current_role_slug}_tiered" ] = $index;
                        }
                        break;
                }//end switch
            }//end foreach
        } else {
            $roles = RolesHelper::get_wholesale_roles();
            $index = 5;
            foreach ( $roles as $role ) {
                $slug                        = $role['slug'];
                $mapping[ "{$slug}_type" ]   = $index++;
                $mapping[ "{$slug}_fixed" ]  = $index++;
                $mapping[ "{$slug}_rate" ]   = $index++;
                $mapping[ "{$slug}_tiered" ] = $index++;
            }
        }//end if

        return $mapping;
    }

    /**
     * Operate to convert data row to data map can be saved
     *
     * @param array $row the data row.
     * @param array $mapping the mapping data from header.
     * @return array
     */
    protected static function operate_pricing( array $row, array $mapping ) {
        $data = [
            $row[ $mapping['id'] ],
            $row[ $mapping['regular_price'] ],
            $row[ $mapping['sale_price'] ],
        ];

        $pricing = ProductPricingHelper::get_product_based_discount_setting( $row[ $mapping['id'] ] );
        $roles   = RolesHelper::get_wholesale_roles();

        $discount_type = $row[ $mapping['discount_type'] ];

        if ( $discount_type !== 'default' ) {
            $pricing['discount_rule'] = 'custom';
            $pricing['discount_type'] = $discount_type === 'fixed_percentage' ? 'by_role' : 'tiered';
        } else {
            $pricing['discount_rule'] = 'default';
        }

        // Map each role to data map
        foreach ( $roles as $role ) {
            $slug = $role['slug'];

            if ( ! array_key_exists( "{$slug}_type", $mapping ) ) {
                continue;
            }

            // Fixed N Rate data
            $type  = $row[ $mapping[ "{$slug}_type" ] ];
            $fixed = floatval( $row[ $mapping[ "{$slug}_fixed" ] ] );
            $rate  = floatval( $row[ $mapping[ "{$slug}_rate" ] ] );

            $pricing['discount_by_role']['wholesaler'][ $slug ] = [
                'type'  => empty( $type ) || $type !== 'percentage' ? 'fixed' : 'rate',
                'fixed' => $fixed > 0 ? $fixed : '',
                'rate'  => $rate > 0 ? $rate : '',
            ];

            // Tier data
            $tier_str = $row[ $mapping[ "{$slug}_tiered" ] ];

            if ( ! empty( $tier_str ) ) {
                $tiers = explode( ';', $tier_str );
                if ( empty( $tiers ) ) {
                    continue;
                }

                $pricing['discount_tiered']['wholesaler'][ $slug ]['tier_list'] = [];
                foreach ( $tiers as $tier ) {
                    $tier_data = explode( ':', $tier );
                    if ( count( $tier_data ) !== 2 ) {
                        continue;
                    }

                    $from  = intval( $tier_data[0] );
                    $price = floatval( $tier_data[1] );

                    if ( $from === 0 ) {
                        $pricing['discount_tiered']['wholesaler'][ $slug ]['base_tier']['price'] = $price;
                    } else {
                        $pricing['discount_tiered']['wholesaler'][ $slug ]['tier_list'][] = [
                            'from'  => $from,
                            'price' => $price,
                        ];
                    }
                }
            }//end if
        }//end foreach

        $data[] = $pricing;

        return $data;
    }

    /**
     * Bulk save pricing from data array
     *
     * @param array $data The data array.
     * @return bool
     */
    protected static function bulk_update_pricing( array $data ) {
        if ( empty( $data ) ) {
            return;
        }

        global $wpdb;

        $meta_values = [
            '_regular_price' => [],
            '_sale_price'    => [],
            '_price'         => [],
            ProductPricingHelper::PRODUCT_BASED_DISCOUNT_KEY => [],
        ];

        $ids = [];

        foreach ( $data as $row ) {
            [ $id, $regular_price, $sale_price, $pricing ] = $row;

            $regular_price = wc_format_decimal( $regular_price );
            $sale_price    = ! empty( $sale_price ) ? wc_format_decimal( $sale_price ) : '';
            $active_price  = ( '' !== $sale_price && (float) $sale_price < (float) $regular_price ) ? $sale_price : $regular_price;

            $ids[] = $id;

            $meta_values['_regular_price'][ $id ] = $regular_price;
            $meta_values['_sale_price'][ $id ]    = $sale_price;
            $meta_values['_price'][ $id ]         = $active_price;
            $meta_values[ ProductPricingHelper::PRODUCT_BASED_DISCOUNT_KEY ][ $id ] = maybe_serialize( $pricing );
        }//end foreach

        if ( empty( $ids ) ) {
            return;
        }

        $ids_placeholder = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

        foreach ( $meta_values as $meta_key => $values ) {
            if ( $meta_key === ProductPricingHelper::PRODUCT_BASED_DISCOUNT_KEY || '_sale_price' === $meta_key ) {
                // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                $existing_ids = $wpdb->get_col(
                    $wpdb->prepare(
                        "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id IN ({$ids_placeholder})",
                        array_merge( [ $meta_key ], $ids )
                    )
                );
                $existing_ids = array_flip( array_map( 'absint', $existing_ids ) );

                $to_update = array_intersect_key( $values, $existing_ids );
                $to_insert = array_diff_key( $values, $to_update );
            } else {
                $to_update = $values;
                $to_insert = [];
            }

            // Update _regular_price, _price, existed _sale_price, existed yaywholesale price
            if ( ! empty( $to_update ) ) {
                $updated = self::bulk_update_meta( $meta_key, $to_update );
                if ( false === $updated ) {
                    return false;
                }
            }//end if

            // Insert unexisted yaywholesale price, unexisted _sale_price
            if ( ! empty( $to_insert ) ) {
                $inserted = self::bulk_insert_meta( $meta_key, $to_insert );
                if ( false === $inserted ) {
                    return false;
                }
            }//end if
        }//end foreach

        foreach ( $ids as $id ) {
            clean_post_cache( $id );
            wc_delete_product_transients( $id );
        }

        self::flush_cache_csv();

        return true;
    }

    /**
     * Bulk update meta with SQL
     *
     * @param string $meta_key The meta key.
     * @param array  $values The meta values with product id.
     * @return bool
     */
    protected static function bulk_update_meta( string $meta_key, array $values ) {
        global $wpdb;

        $cases = '';
        $args  = [];

        foreach ( $values as $id => $value ) {
            $cases .= 'WHEN %d THEN %s ';
            $args[] = $id;
            $args[] = $value;
        }

        $args[] = $meta_key;
        $args   = array_merge( $args, array_keys( $values ) );

        $update_ids_placeholder = implode( ',', array_fill( 0, count( $values ), '%d' ) );

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $result = $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$wpdb->postmeta}
                    SET meta_value = CASE post_id {$cases} END
                WHERE
                    meta_key = %s AND
                    post_id IN ({$update_ids_placeholder})", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $args
            )
        );

        return $result;
    }

    /**
     * Bulk insert meta with SQL
     *
     * @param string $meta_key The meta key.
     * @param array  $values The meta values with product id.
     * @return bool
     */
    protected static function bulk_insert_meta( string $meta_key, array $values ) {
        global $wpdb;
        $rows_sql = [];
        $args     = [];

        foreach ( $values as $id => $value ) {
            $rows_sql[] = '(%d, %s, %s)';
            $args[]     = $id;
            $args[]     = $meta_key;
            $args[]     = $value;
        }

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        $result = $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO
                {$wpdb->postmeta}
                (post_id, meta_key, meta_value)
                VALUES " . implode( ', ', $rows_sql ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $args
            )
        );

        return $result;
    }
}
