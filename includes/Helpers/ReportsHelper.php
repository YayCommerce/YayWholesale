<?php

namespace YayWholesaleB2B\Helpers;

use DateTime;

/**
 * Common Helper
 */
class ReportsHelper {

    public static function get_wholesale_report( string $compare_start_date, string $compare_end_date, string $start_date, string $end_date ) {
        $default_date_range = self::get_default_report_date();

        if ( ! isset( $start_date ) ) {
            $start_date         = $default_date_range['default_start_date'];
            $compare_start_date = $default_date_range['default_compare_start_date'];
        }

        if ( ! isset( $end_date ) ) {
            $end_date         = $default_date_range['default_end_date'];
            $compare_end_date = $default_date_range['default_compare_end_date'];
        }

        $ywhs_transient = get_transient(
            'ywhs_report_statistic_'
            . $compare_start_date
            . '_'
            . $compare_end_date
            . '_'
            . $start_date
            . '_'
            . $end_date
        );

        if ( false !== $ywhs_transient ) {
            return $ywhs_transient;
        }

        $ywhs_statistic = self::statistic_data( $start_date, $end_date, $compare_start_date, $compare_end_date );

        if ( $start_date === $default_date_range['default_start_date'] &&
            $end_date === $default_date_range['default_end_date'] &&
            $compare_start_date === $default_date_range['default_compare_start_date'] &&
            $compare_end_date === $default_date_range['default_compare_end_date'] ) {
            set_transient(
                'ywhs_report_statistic_'
                . $compare_start_date
                . '_'
                . $compare_end_date
                . '_'
                . $start_date
                . '_'
                . $end_date,
                $ywhs_statistic,
                600
            );
        }

        return $ywhs_statistic;
    }

    public static function delete_ywhs_report_transient() {
        $default_range_transient = self::get_default_report_date();

        delete_transient(
            'ywhs_report_statistic_'
            . $default_range_transient['default_compare_start_date']
            . '_'
            . $default_range_transient['default_compare_end_date']
            . '_'
            . $default_range_transient['default_start_date']
            . '_'
            . $default_range_transient['default_end_date']
        );
    }

    protected static function get_default_report_date() {
        $date = new DateTime();
        $date->modify( '-30 days' );
        $default_start_date         = $date->format( 'Y-m-d' );
        $default_compare_start_date = $date->modify( '-31 days' )->format( 'Y-m-d' );

        $now                      = new DateTime();
        $default_end_date         = $now->format( 'Y-m-d' );
        $default_compare_end_date = $now->modify( '-31 days' )->format( 'Y-m-d' );

        $default_date_range = [
            'default_start_date'         => $default_start_date,
            'default_end_date'           => $default_end_date,
            'default_compare_start_date' => $default_compare_start_date,
            'default_compare_end_date'   => $default_compare_end_date,
        ];

        return $default_date_range;
    }

    protected static function get_orders_to_statistic( $start_date, $end_date ) {
        $args = [
            'limit'                  => -1,
            'update_post_meta_cache' => true,
            'status'                 => [ 'pending', 'on-hold', 'processing', 'completed' ],
            'meta_query'             => [
                [
                    'key'     => '_ywhs_wholesale_role',
                    'compare' => 'EXISTS',
                ],
            ],
            'date_created'           => $start_date . '...' . $end_date,
        ];

        return wc_get_orders( $args );
    }

    protected static function statistic_data( $start_date, $end_date, $compare_start_date, $compare_end_date ) {
        $revenue            = 0;
        $top_wholesaler     = [];
        $top_product        = [];
        $order_list         = self::get_orders_to_statistic( $start_date, $end_date );
        $compare_order_list = self::get_orders_to_statistic( $compare_start_date, $compare_end_date );
        foreach ( $order_list as $order ) {
            if ( ! $order instanceof \WC_Order ) {
                continue;
            }

            $revenue    += apply_filters( 'ywhs_convert_price_from_order', $order->get_total(), $order, true );
            $customer_id = $order->get_customer_id();
            $order_role  = $order->get_meta( '_ywhs_wholesale_role' );
            if ( isset( $top_wholesaler[ $customer_id ] ) ) {
                $top_wholesaler[ $customer_id ]['orderCount'] += 1;
            } else {
                $top_wholesaler[ $customer_id ] = [
                    'id'         => 0,
                    'role'       => $order_role,
                    'orderCount' => 1,
                    'name'       => __( 'Unknown User', 'yay-wholesale-b2b' ),
                    'avatar'     => '',
                ];
            }

            foreach ( $order->get_items() as $item ) {
                if ( ! $item instanceof \WC_Order_Item_Product ) {
                    continue;
                }

                $product_id                 = $item->get_product_id();
                $line_item_revenue          = apply_filters( 'ywhs_convert_price_from_order', $item->get_total() + $item->get_total_tax(), $order, true );
                $top_product[ $product_id ] = [
                    'name'       => __( 'Unknown Product', 'yay-wholesale-b2b' ),
                    'image'      => '',
                    'orderCount' => isset( $top_product[ $product_id ] ) ? $top_product[ $product_id ]['orderCount'] + $item->get_quantity() : $item->get_quantity(),
                    'netSale'    => isset( $top_product[ $product_id ] ) ? $top_product[ $product_id ]['netSale'] + $line_item_revenue : $line_item_revenue,
                ];
            }
        }//end foreach

        $compare_count       = count( $compare_order_list );
        $compare_revenue     = 0;
        $compare_wholesalers = [];
        foreach ( $compare_order_list as $p_order ) {
            if ( ! $p_order instanceof \WC_Order ) {
                continue;
            }

            $compare_revenue += floatval( apply_filters( 'ywhs_convert_price_from_order', $p_order->get_total(), $p_order, true ) );
            if ( ! in_array( $p_order->get_customer_id(), $compare_wholesalers, true ) ) {
                $compare_wholesalers[] = $p_order->get_customer_id();
            }
        }

        $count_increase_rate     = round( ( count( $order_list ) - $compare_count ) / max( 1, $compare_count ) * 100, 2 );
        $revenue_increase_rate   = round( ( $revenue - $compare_revenue ) / max( 1, $compare_revenue ) * 100, 2 );
        $wholesale_increase_rate = round( ( count( $top_wholesaler ) - count( $compare_wholesalers ) ) / max( 1, count( $compare_wholesalers ) ) * 100, 2 );

        uasort(
            $top_wholesaler,
            function ( $a, $b ) {
                return $b['orderCount'] <=> $a['orderCount'];
            }
        );
        uasort(
            $top_product,
            function ( $a, $b ) {
                return $b['orderCount'] <=> $a['orderCount'];
            }
        );

        return [
            'revenue'                 => $revenue,
            'revenueIncreaseRate'     => $revenue_increase_rate,
            'orderAmount'             => count( $order_list ),
            'orderIncreaseRate'       => $count_increase_rate,
            'wholesalersAmount'       => count( $top_wholesaler ),
            'wholesalersIncreaseRate' => $wholesale_increase_rate,
            'topWholesalers'          => self::statistic_wholesaler( array_slice( $top_wholesaler, 0, 10, true ) ),
            'topProducts'             => self::statistic_products( array_slice( $top_product, 0, 10, true ) ),
        ];
    }

    protected static function statistic_wholesaler( array $top_wholesaler ) {
        $roles = get_option( 'yaywholesaleb2b_roles', [] );

        if ( empty( $roles ) ) {
            return [];
        }

        $wholesale_slugs = array_filter(
            array_map( fn( $r ) => $r['slug'] ?? null, $roles )
        );

        if ( ! empty( $top_wholesaler ) ) {
            $query_args = [
                'include' => array_keys( $top_wholesaler ),
            ];
            $query      = new \WP_User_Query( $query_args );
            $users      = $query->get_results();

            foreach ( $users as $user ) {
                if ( ! $user instanceof \WP_User ) {
                    continue;
                }
                $amount    = $top_wholesaler[ $user->ID ]['orderCount'];
                $user_role = array_values(
                    array_filter(
                        $user->roles,
                        function ( $r ) use ( $wholesale_slugs ) {
                            return in_array( $r, $wholesale_slugs, true );
                        }
                    )
                );

                $role;
                if ( empty( $user_role ) ) {
                    $role = $top_wholesaler[ $user->ID ]['role'];
                } else {
                    $role = RolesHelper::get_role_by_slug( $roles, $user_role[0] )['name'];
                }
                $top_wholesaler[ $user->ID ] = [
                    'id'         => $user->ID,
                    'name'       => $user->display_name,
                    'avatar'     => get_avatar_url( $user->ID ),
                    'role'       => $role,
                    'orderCount' => $amount,
                ];
            }//end foreach
        }//end if

        return array_values( $top_wholesaler );
    }

    protected static function statistic_products( $top_product ) {
        if ( ! empty( $top_product ) ) {
            $args     = [
                'include' => array_keys( $top_product ),
            ];
            $products = wc_get_products( $args );

            foreach ( $products as $product ) {
                if ( ! $product instanceof \WC_Product ) {
                    return;
                }

                $top_product[ $product->get_id() ] = array_merge(
                    $top_product[ $product->get_id() ],
                    [
                        'name'  => $product->get_name(),
                        'image' => wp_get_attachment_url( $product->get_image_id() ) ? wp_get_attachment_url( $product->get_image_id() ) : '',
                    ]
                );
            }
        }//end if

        return array_values( $top_product );
    }
}
