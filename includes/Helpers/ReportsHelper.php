<?php

namespace Yay_Wholesale\Helpers;

use WP_User_Query;

/**
 * Common Helper
 */
class ReportsHelper {
    public const REPORT_TRANSIENT = 'ywhs_report_statistic';

    protected static function get_orders_to_statistic( $start_date, $end_date ) {
        $args = [
            'limit'        => -1,
            'status'       => [ 'pending', 'on-hold', 'processing', 'completed' ],
            'meta_query'   => [
                [
                    'key'     => '_ywhs_wholesale_role',
                    'compare' => 'EXISTS',
                ],
            ],
            'date_created' => $start_date . '...' . $end_date,
        ];

        return wc_get_orders( $args );
    }

    protected static function get_previous_orders_to_statistic( $start_date ) {
        $args = [
            'limit'        => -1,
            'status'       => [ 'pending', 'on-hold', 'processing', 'completed' ],
            'meta_query'   => [
                [
                    'key'     => '_ywhs_wholesale_role',
                    'compare' => 'EXISTS',
                ],
            ],
            'date_created' => '<' . $start_date,
        ];

        return wc_get_orders( $args );
    }

    public static function statistic_data( $start_date, $end_date ) {
        $revenue             = 0;
        $top_wholesaler      = [];
        $top_product         = [];
        $order_list          = self::get_orders_to_statistic( $start_date, $end_date );
        $previous_order_list = self::get_previous_orders_to_statistic( $start_date );
        foreach ( $order_list as $order ) {
            if ( ! $order instanceof \WC_Order ) {
                continue;
            }

            $revenue                       += $order->get_subtotal();
            $customer_id                    = $order->get_customer_id();
            $top_wholesaler[ $customer_id ] = isset( $top_wholesaler[ $customer_id ] ) ? $top_wholesaler[ $customer_id ] + 1 : 1;

            foreach ( $order->get_items() as $item ) {
                if ( ! $item instanceof \WC_Order_Item_Product ) {
                    continue;
                }

                $product_id                 = $item->get_product_id();
                $top_product[ $product_id ] = [
                    'orderCount' => isset( $top_product[ $product_id ] ) ? $top_product[ $product_id ]['quantity'] + $item->get_quantity() : $item->get_quantity(),
                    'netSale'    => isset( $top_product[ $product_id ] ) ? $top_product[ $product_id ]['net_sale'] + $item->get_subtotal() : $item->get_subtotal(),
                ];
            }
        }//end foreach

        $previous_count   = count( $previous_order_list );
        $previous_revenue = 0;
        foreach ( $previous_order_list as $p_order ) {
            if ( ! $p_order instanceof \WC_Order ) {
                continue;
            }

            $previous_revenue += $p_order->get_subtotal();
        }

        $count_increase_rate   = count( $order_list ) / max( 1, $previous_count ) * 100;
        $revenue_increase_rate = $revenue / max( 1, $previous_revenue ) * 100;

        arsort( $top_wholesaler );
        arsort( $top_product );

        return array_merge(
            [
                'revenue'             => $revenue,
                'revenueIncreaseRate' => $revenue_increase_rate,
                'orderAmount'         => count( $order_list ),
                'orderIncreaseRate'   => $count_increase_rate,
            ],
            self::statistic_wholesaler( $start_date, $end_date, array_slice( $top_wholesaler, 0, 10, true ) ),
            self::statistic_products( array_slice( $top_product, 0, 10, true ) ),
        );
    }

    protected static function statistic_wholesaler( $start_date, $end_date, array $top_wholesaler ) {
        $roles = get_option( 'yay_wholesale_roles', [] );

        if ( empty( $roles ) ) {
            return [];
        }

        $wholesale_slugs = array_filter(
            array_map( fn( $r ) => $r['slug'] ?? null, $roles )
        );

        $query_args = [
            'role__in'   => $wholesale_slugs,
            'fields'     => 'ID',
            'date_query' => [
                [
                    'before'    => $end_date,
                    'inclusive' => true,
                ],
            ],
        ];

        $query       = new \WP_User_Query( $query_args );
        $total_count = (int) $query->get_total();

        $query_args['date_query'] = [
            [
                'after'     => $start_date,
                'before'    => $end_date,
                'inclusive' => true,
            ],
        ];
        $query                    = new \WP_User_Query( $query_args );
        $current_count            = (int) $query->get_total();

        $previous_count = max( ( $total_count - $current_count ), 1 );
        $increase_rate  = $current_count / $previous_count * 100;

        if ( ! empty( $top_wholesaler ) ) {
            $query_args = [
                'role__in' => $wholesale_slugs,
                'include'  => array_keys( $top_wholesaler ),
            ];
            $query      = new \WP_User_Query( $query_args );
            $users      = $query->get_results();

            foreach ( $users as $user ) {
                if ( ! $user instanceof \WP_User ) {
                    continue;
                }
                $amount                      = $top_wholesaler[ $user->ID ];
                $top_wholesaler[ $user->ID ] = [
                    'name'       => $user->display_name,
                    'avatar'     => get_avatar_url( $user->ID ),
                    'role'       => array_values(
                        array_filter(
                            $user->roles,
                            function ( $r ) use ( $wholesale_slugs ) {
                                return in_array( $r, $wholesale_slugs, true );
                            }
                        )
                    )[0],
                    'orderCount' => $amount,
                ];
            }
        }//end if

        return [
            'wholesalersAmount'       => max( 0, $current_count ),
            'wholesalersIncreaseRate' => $increase_rate,
            'topWholesalers'          => array_values( $top_wholesaler ),
        ];
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
                        'image' => wp_get_attachment_url( $product->get_image_id() ),
                    ]
                );
            }
        }//end if

        return [ 'topProducts' => array_values( $top_product ) ];
    }
}
