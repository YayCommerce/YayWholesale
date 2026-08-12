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
            // translators: %s : Role name
            $headers[] = $role['slug'] . ': ' . sprintf( __( '%s price', 'yay-wholesale-b2b' ), $role['name'] );
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
            $discount_type          = $pricing['discount_type'] ?? 'by_role';
            $wholesalers_fixed_rate = $pricing['discount_by_role']['wholesaler'];
            $wholesalers_tier       = $pricing['discount_tiered']['wholesaler'];

            $row = [
                $product->get_id(),
                $product->get_name() . ' (SKU: ' . $product->get_sku() . ' )',
                $product->get_regular_price(),
                $product->get_sale_price() ?? '',
                $discount_rule,
            ];

            // Handle by role
            foreach ( $roles as $role ) {
                $slug = $role['slug'];
                if ( $discount_type === 'by_role' ) {
                    if ( array_key_exists( $slug, $wholesalers_fixed_rate ) ) {
                        $type = $wholesalers_fixed_rate[ $slug ]['type'];
                        if ( $type === 'fixed' ) {
                            $value = $wholesalers_fixed_rate[ $slug ]['fixed'];
                        } else {
                            $value = ! empty( $wholesalers_fixed_rate[ $slug ]['rate'] ) ? $wholesalers_fixed_rate[ $slug ]['rate'] . '%' : '';
                        }
                    } else {
                        $value = '';
                    }
                } elseif ( array_key_exists( $slug, $wholesalers_tier ) ) {
                        $value  = '0:' . $wholesalers_tier[ $slug ]['base_tier']['price'] . ';';
                        $value .= implode( ';', array_map( fn( $tier ) => $tier['from'] . ':' . $tier['price'], $wholesalers_tier[ $slug ]['tier_list'] ) );
                } else {
                    $value = '';
                }

                $row[] = $value;
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
            $logs[] = __( 'The CSV file could not be found.', 'yay-wholesale-b2b' );
            return $logs;
        }

        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }

        $csv_content = $wp_filesystem->get_contents( $filepath );

        if ( false === $csv_content ) {
            $logs[] = __( 'The CSV file could not be read.', 'yay-wholesale-b2b' );
            return $logs;
        }

        $rows    = array_map( fn( $row ) => str_getcsv( $row, ',', '"', '\\' ), preg_split( "/\r\n|\n|\r/", $csv_content ) );
        $headers = array_shift( $rows );
        $mapping = self::operate_header( $headers );

        foreach ( array_chunk( $rows, 100 ) as $batch ) {
            $product_ids = array_filter(
                array_map( 'absint', array_column( $batch, $mapping['id'] ) )
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

            $import_list = [];
            foreach ( $batch as $index => $row ) {
                if ( empty( $row ) ) {
                    // translators: %d: the row number
                    $logs[] = sprintf( __( 'Row %d: This row is empty and was skipped.', 'yay-wholesale-b2b' ), $index + 2 );
                    continue;
                }

                if ( count( $row ) !== count( $mapping ) ) {
                    // translators: %d: the row number
                    $logs[] = sprintf( __( 'Row %d: The number of columns does not match the CSV header and was skipped.', 'yay-wholesale-b2b' ), $index + 2 );
                    continue;
                }

                $product = array_filter( $products, fn( $p ) => $p->get_id() === intval( $row[ $mapping['id'] ] ) );

                if ( empty( $product ) ) {
                    // translators: %d: the row number
                    $logs[] = sprintf( __( 'Row %d: No matching product was found.', 'yay-wholesale-b2b' ), $index + 2 );
                    continue;
                }

                $data = self::operate_pricing( $row, $mapping, $logs, $index + 2 );

                if ( ! empty( $data ) ) {
                    self::save_pricing_meta( $data, $index + 2, $logs );

                    $import_list[] = $data;
                    do_action( 'ywhs_after_imported_pricing_item', $data, $logs );
                }
            }//end foreach
        }//end foreach

        self::flush_cache_csv();

        do_action( 'ywhs_after_imported_pricing', $import_list, $logs );

        return $logs;
    }

    /**
     * Save the pricing meta, logging any meta write that fails at the DB level
     *
     * @param array $data the row data from operate_pricing().
     * @param int   $row_number the csv row number.
     * @param array $logs the logging.
     */
    protected static function save_pricing_meta( array $data, int $row_number, array &$logs ) {
        global $wpdb;

        $meta_updates = [
            '_regular_price' => $data['regular_price'],
            '_sale_price'    => $data['sale_price'],
            '_price'         => ! empty( $data['sale_price'] ) ? $data['sale_price'] : $data['regular_price'],
            ProductPricingHelper::PRODUCT_BASED_DISCOUNT_KEY => $data['discount_setting'],
        ];

        foreach ( $meta_updates as $meta_key => $meta_value ) {
            $result = update_post_meta( $data['id'], $meta_key, $meta_value );

            if ( false === $result && ! empty( $wpdb->last_error ) ) {
                // translators: %1$d: the row number, %2$s: the meta key, %3$d: the product id, %4$s: the database error message
                $logs[] = sprintf( __( 'Row %1$d: Could not save %2$s for product #%3$d — %4$s', 'yay-wholesale-b2b' ), $row_number, $meta_key, $data['id'], $wpdb->last_error );
                return;
            }
        }

        // translators: %d: the row number
        $logs[] = sprintf( __( 'Row %d: Pricing saved successfully.', 'yay-wholesale-b2b' ), $row_number );
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
            'discount_rule' => 4,
        ];

        if ( count( $row ) > 5 ) {
            foreach ( $row as $index => $col ) {
                if ( $index < 5 ) {
                    continue;
                }

                $header_role_map = explode( ':', $col );
                $role_slug       = $header_role_map[ array_key_first( $header_role_map ) ] ?? '';
                if ( ! empty( $role_slug ) ) {
                    $mapping[ $role_slug ] = $index;
                }
            }//end foreach
        }

        if ( count( $mapping ) <= 5 ) {
            $roles = RolesHelper::get_wholesale_roles();
            $index = 5;
            foreach ( $roles as $role ) {
                $mapping[ $role['slug'] ] = $index++;
            }
        }//end if

        return $mapping;
    }

    /**
     * Operate to convert data row to data map can be saved
     *
     * @param array $row the data row.
     * @param array $mapping the mapping data from header.
     * @param array $logs The logging.
     * @param int   $row_number The current handling row number.
     * @return array
     */
    protected static function operate_pricing( array $row, array $mapping, array &$logs, int $row_number ) {
        $data = [
            'id'               => $row[ $mapping['id'] ],
            'regular_price'    => $row[ $mapping['regular_price'] ],
            'sale_price'       => $row[ $mapping['sale_price'] ],
            'discount_setting' => [],
        ];

        $pricing = ProductPricingHelper::get_product_based_discount_setting( $row[ $mapping['id'] ] );
        $roles   = RolesHelper::get_wholesale_roles();

        $discount_rule            = $row[ $mapping['discount_rule'] ];
        $pricing['discount_rule'] = $discount_rule !== 'custom' ? 'default' : 'custom';

        $discount_type_map = [
            'tiered'  => 0,
            'by_role' => 0,
        ];
        foreach ( $roles as $role ) {
            $slug = $role['slug'];

            if ( ! array_key_exists( $slug, $mapping ) ) {
                continue;
            }

            $price = $row[ $mapping[ $slug ] ];
            if ( ! empty( $price ) ) {
                if ( self::is_tiered_price_format( $price ) ) {
                    ++$discount_type_map['tiered'];
                }

                if ( self::is_fixed_price_format( $price ) || self::is_rate_discount_format( $price ) ) {
                    ++$discount_type_map['by_role'];
                }
            }
        }

        if ( $discount_type_map['tiered'] > 0 && $discount_type_map['by_role'] > 0 ) {
            // translators: %1$d: the row number
            $logs[] = sprintf( __( 'Row %1$d: The price settings mixes fixed/percentage pricing with tiered pricing.', 'yay-wholesale-b2b' ), $row_number );
            return [];
        }

        $discount_type = array_search( max( $discount_type_map ), $discount_type_map, true );

        // Map each role to data map
        foreach ( $roles as $role ) {
            $slug = $role['slug'];

            if ( ! array_key_exists( $slug, $mapping ) ) {
                continue;
            }

            $price = $row[ $mapping[ $slug ] ];

            if ( 'tiered' === $discount_type ) {
                if ( ! self::is_tiered_price_format( $price ) ) {
                    // translators: %1$d: the row number, %2$s: the role name
                    $logs[] = sprintf( __( 'Row %1$d: The price for %2$s is in an invalid format.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                    return [];
                }
            }

            if ( 'by_role' === $discount_type ) {
                if ( ! self::is_fixed_price_format( $price ) && ! self::is_rate_discount_format( $price ) ) {
                    // translators: %1$d: the row number, %2$s: the role name
                    $logs[] = sprintf( __( 'Row %1$d: The price for %2$s is in an invalid format.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                    return [];
                }
            }//end if

            $pricing['discount_type'] = $discount_type;

            if ( 'by_role' === $discount_type && ! self::apply_by_role_pricing( $pricing, $slug, $price, $role, $row_number, $logs ) ) {
                return [];
            }

            if ( 'tiered' === $discount_type && ! self::apply_tiered_pricing( $pricing, $slug, $price, $role, $row_number, $logs ) ) {
                return [];
            }
        }//end foreach

        $data['discount_setting'] = $pricing;

        return $data;
    }

    /**
     * Apply fixed / rate pricing for a role onto the pricing data.
     *
     * @param array  $pricing pricing data, passed by reference.
     * @param string $slug the role slug.
     * @param string $price the role's raw price value.
     * @param array  $role the wholesale role.
     * @param int    $row_number the csv row number (for logging).
     * @param array  $logs logs passed by reference.
     * @return bool true on success, false when the row is invalid.
     */
    protected static function apply_by_role_pricing( array &$pricing, string $slug, string $price, array $role, int $row_number, array &$logs ) {
        $is_rate = self::is_rate_discount_format( $price );
        $value   = floatval( $price );

        $pricing['discount_by_role']['wholesaler'][ $slug ]['type'] = $is_rate ? 'rate' : 'fixed';

        $decimals = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );
        if ( $is_rate ) {
            if ( $value > 100 || $value < 0 ) {
                // translators: %1$d: the row number, %2$s: the role name
                $logs[] = sprintf( __( 'Row %1$d: The percentage for %2$s must be between 0 and 100.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                return false;
            }
            $pricing['discount_by_role']['wholesaler'][ $slug ]['rate'] = $value > 0 ? wc_format_decimal( $value, $decimals, true ) : '';
            return true;
        }

        if ( $value < 0 ) {
            // translators: %1$d: the row number, %2$s: the role name
            $logs[] = sprintf( __( 'Row %1$d: The price for %2$s cannot be negative.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
            return false;
        }
        $pricing['discount_by_role']['wholesaler'][ $slug ]['fixed'] = $value > 0 ? wc_format_decimal( $value, $decimals, true ) : '';

        return true;
    }

    /**
     * Apply tiered pricing for a role onto the pricing data.
     *
     * @param array  $pricing pricing data, passed by reference.
     * @param string $slug the role slug.
     * @param string $price the role's raw tiered price value, e.g. "0:12;1:2312;10:2345".
     * @param array  $role the wholesale role.
     * @param int    $row_number the csv row number (for logging).
     * @param array  $logs logs passed by reference.
     * @return bool true on success, false when the row is invalid.
     */
    protected static function apply_tiered_pricing( array &$pricing, string $slug, string $price, array $role, int $row_number, array &$logs ) {
        if ( empty( $price ) ) {
            return true;
        }

        $tiers            = explode( ';', $price );
        $has_base_price   = false;
        $base_price       = 0;
        $tmp_tier_list    = [];
        $existed_quantity = [];

        foreach ( $tiers as $tier ) {
            $tier_data = explode( ':', $tier );
            if ( count( $tier_data ) !== 2 ) {
                continue;
            }

            $from  = intval( $tier_data[0] );
            $price = $tier_data[1];

            if ( in_array( $from, $existed_quantity, true ) ) {
                // translators: %1$d: the row number, %2$s: the role name
                $logs[] = sprintf( __( 'Row %1$d: The tiered pricing for %2$s has a duplicate quantity threshold.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                return false;
            }

            if ( ! self::is_fixed_price_format( $price ) ) {
                // translators: %1$d: the row number, %2$s: the role name
                $logs[] = sprintf( __( 'Row %1$d: The tiered pricing for %2$s contains an invalid price value.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                return false;
            }

            if ( $from < 0 ) {
                // translators: %1$d: the row number, %2$s: the role name
                $logs[] = sprintf( __( 'Row %1$d: The tiered pricing for %2$s contains a negative threshold.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                return false;
            }

            if ( $price < 0 ) {
                // translators: %1$d: the row number, %2$s: the role name
                $logs[] = sprintf( __( 'Row %1$d: The tiered pricing for %2$s contains a negative price.', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
                return false;
            }

            $existed_quantity[] = $from;
            $decimals           = absint( get_option( 'woocommerce_price_num_decimals', 2 ) );
            $price              = wc_format_decimal( floatval( $price ), $decimals, true );

            if ( $from === 0 ) {
                $has_base_price = true;
                $base_price     = $price;
            } else {
                $tmp_tier_list[] = [
                    'from'  => $from,
                    'price' => $price,
                ];
            }
        }//end foreach

        if ( ! $has_base_price ) {
            // translators: %1$d: the row number, %2$s: the role name
            $logs[] = sprintf( __( 'Row %1$d: The tiered pricing for %2$s is missing a base price (quantity 0).', 'yay-wholesale-b2b' ), $row_number, $role['name'] );
            return false;
        }

        usort( $tmp_tier_list, fn( $a, $b ) => $a['from'] <=> $b['from'] );

        $pricing['discount_tiered']['wholesaler'][ $slug ]['base_tier']['price'] = $base_price > 0 ? $base_price : '';
        $pricing['discount_tiered']['wholesaler'][ $slug ]['tier_list']          = $tmp_tier_list;

        return true;
    }

    /**
     * Check whether a value follows the tiered format: "from:price;from:price;..."
     *
     * @param string $value
     * @return bool
     */
    protected static function is_tiered_price_format( $value ) {
        if ( empty( $value ) ) {
            return true;
        }

        return (bool) preg_match( '/^-?\d+:-?\d+(\.\d+)?(?:;-?\d+:-?\d+(\.\d+)?)*$/', trim( $value ) );
    }

    /**
     * Check whether a value follows the percentage format: "value%"
     *
     * @param string $value
     * @return bool
     */
    protected static function is_rate_discount_format( $value ) {
        if ( empty( $value ) ) {
            return true;
        }

        return (bool) preg_match( '/\d+(\.\d+)?%/', trim( $value ) );
    }

    /**
     * Check whether a value is a plain numeric price using only "." as the decimal separator.
     *
     * @param string $value
     * @return bool
     */
    protected static function is_fixed_price_format( $value ) {
        if ( empty( $value ) ) {
            return true;
        }

        return (bool) preg_match( '/^-?\d+(\.\d+)?$/', trim( $value ) );
    }
}
