<?php

namespace YayWholesaleB2B\Pro\Helpers\AccessHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;

/**
 * Product Based Access Helper
 */
class ProductAccessHelper {
    const ACCESS_RULE           = 'yaywholesaleb2b_access_rule';
    const ACCESS_RETAILERS      = 'yaywholesaleb2b_access_retailers';
    const ACCESS_WHOLESALERS    = 'yaywholesaleb2b_access_wholesalers';
    const ACCESS_SELECTED_ROLES = 'yaywholesaleb2b-access_selected-roles';

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
        update_post_meta( $product_id, self::ACCESS_RULE, $data['rule'] );
        update_post_meta( $product_id, self::ACCESS_RETAILERS, $data['retailers'] );
        update_post_meta( $product_id, self::ACCESS_WHOLESALERS, $data['wholesalers'] );
        update_post_meta( $product_id, self::ACCESS_SELECTED_ROLES, implode( ', ', $data['selected_roles'] ) );
    }

    public static function get_product_based_access_restriction( int $product_id ) {
        $rule = get_post_meta( $product_id, self::ACCESS_RULE, true );
        if ( ! empty( $rule ) ) {
            $selected_roles = explode( ', ', get_post_meta( $product_id, self::ACCESS_SELECTED_ROLES, true ) );
            $retailers      = get_post_meta( $product_id, self::ACCESS_RETAILERS, true );
            $wholesalers    = get_post_meta( $product_id, self::ACCESS_WHOLESALERS, true );
            return [
                'rule'           => $rule,
                'retailers'      => $retailers,
                'wholesalers'    => $wholesalers,
                'selected_roles' => $selected_roles,
            ];
        } else {
            return self::get_default_settings();
        }
    }

    public static function is_accessible_product( bool $access, int $product_id, array $wholesale_role ) {
        $access_data = self::get_product_based_access_restriction( $product_id );
        if ( empty( $access_data ) || 'visible-all' === $access_data['rule'] ) {
            return $access;
        }

        if ( $wholesale_role !== null ) {
            if ( 'disabled' === $access_data['wholesalers'] ) {
                return false;
            }

            if ( 'enabled' === $access_data['wholesalers'] || in_array( $wholesale_role['slug'], $access_data['selected_roles'], true ) ) {
                return $access;
            }
        } else {
            if ( 'disabled' === $access_data['retailers'] ) {
                return false;
            }

            if ( 'enabled' === $access_data['retailers'] ) {
                return $access;
            }
        }

        return false;
    }

    public static function get_default_settings() {
        return [
            'rule'           => 'visible-all',
            'retailers'      => 'enabled',
            'wholesalers'    => 'enabled',
            'selected_roles' => [],
        ];
    }

    public static function get_blocked_product_ids( $wholesale_role = null ) {
        $args = [
            'post_type'              => [ 'product', 'product_variation' ],
            'posts_per_page'         => -1,
            'update_post_meta_cache' => true,
            'fields'                 => 'ids',
            'meta_query'             => [
                'relation' => 'AND',
                [
                    'key'     => self::ACCESS_RULE,
                    'value'   => 'visible-specific-roles',
                    'compare' => '=',
                    'type'    => 'CHAR',
                ],
            ],
        ];

        if ( ! isset( $wholesale_role ) ) {
            $args['meta_query'][] = [
                'key'     => self::ACCESS_RETAILERS,
                'value'   => 'disabled',
                'compare' => '=',
                'type'    => 'CHAR',
            ];
        } else {
            $args['meta_query'][] =
            [
                'relation' => 'OR',
                [
                    'key'     => self::ACCESS_WHOLESALERS,
                    'value'   => 'disabled',
                    'compare' => '=',
                    'type'    => 'CHAR',
                ],
                [
                    'key'     => self::ACCESS_SELECTED_ROLES,
                    'value'   => $wholesale_role['slug'],
                    'compare' => 'NOT LIKE',
                    'type'    => 'CHAR',
                ],
            ];
        }//end if

        $query = new \WP_Query( $args );
        return $query->posts;
    }

    public static function get_blocked_product_with_children_ids( $general_blocked_product_ids ) {
        // $products = wc_get_products(
        // [
        // 'type'  => [ 'variable', 'grouped' ],
        // 'limit' => -1,
        // ]
        // );

        // $variation_map = [];
        // foreach ( $products as $product ) {
        // $variation_map[ $product->get_id() ] = 0;
        // foreach ( $product->get_children() as $children_id ) {
        // if ( ! in_array( $children_id, $general_blocked_product_ids, true ) ) {
        // $variation_map[ $product->get_id() ] += 1;
        // }
        // }
        // }

        global $wpdb;

        $sql = "SELECT p.post_parent as parent_id, p.ID as product_id, pm.meta_value as children_id
        FROM {$wpdb->posts} p
        LEFT JOIN {$wpdb->postmeta} pm ON  p.id = pm.post_id and pm.meta_key='_children'
        WHERE p.post_type = 'product_variation' OR pm.meta_value IS NOT NULL
        ";

        $rows          = $wpdb->get_results( $sql, ARRAY_A );
        $variation_map = [];
        foreach ( $rows as $row ) {
            if ( ! empty( intval( $row['parent_id'] ) ) ) {
                // In this case: this row is a variable product, main product id is parent_id, children variation are product_id (post_type = "product_variation")

                if ( ! array_key_exists( $row['parent_id'], $variation_map ) ) {
                    $variation_map[ $row['parent_id'] ] = 0;
                }

                if ( ! in_array( intval( $row['product_id'] ), $general_blocked_product_ids, true ) ) {
                    $variation_map[ $row['parent_id'] ] += 1;
                }
            } elseif ( ! empty( $row['children_id'] ) ) {
                // In this case: this row is a grouped product, main product id is product_id, children products are children_id (pm.meta_key='_children' and pm.meta_value IS NOT NULL)
                if ( ! array_key_exists( $row['product_id'], $variation_map ) ) {
                    $variation_map[ $row['product_id'] ] = 0;
                }
                $children_ids = maybe_unserialize( $row['children_id'] );
                if ( is_array( $children_ids ) ) {
                    foreach ( $children_ids as $children_id ) {
                        if ( ! in_array( $children_id, $general_blocked_product_ids, true ) ) {
                            $variation_map[ $row['product_id'] ] += 1;
                        }
                    }
                }
            }//end if
        }//end foreach
        return array_keys( array_filter( $variation_map, fn( $value ) =>  $value < 1 ) );
    }
}
