<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;
use Automattic\WooCommerce\Utilities\OrderUtil;
/**
 * WholeSalers Helper Class
 */
class WholeSalersHelper {

    /**
     * Get the list of wholesalers.
     *
     * @param string $search The search keyword.
     * @param int    $page The page number.
     * @param int    $per_page The number of items per page.
     * @param string $role_slug
     * @return array The list of wholesalers.
     */
    public static function get_paginated_wholesalers_list( string $search, int $page, int $per_page, string $role_slug = '' ): array {
        $all_roles = RolesHelper::get_wholesale_roles();

        if ( empty( $all_roles ) ) {
            return [
                'currentPage' => $page,
                'totalPage'   => 0,
                'totalItems'  => 0,
                'data'        => [],
            ];
        }

        $wholesale_slugs = array_filter(
            array_map( fn( $r ) => $r['status'] ? $r['slug'] : null, $all_roles )
        );

        if ( ! empty( $role_slug ) ) {
            $wholesale_slugs = [ $role_slug ];
        }

        $query_args = array_merge(
            [
                'role__in' => $wholesale_slugs,
                'number'   => $per_page,
                'offset'   => ( $page - 1 ) * $per_page,
                'fields'   => 'all_with_meta',
            ],
            self::build_search_args( $search )
        );

        $query                = new \WP_User_Query( $query_args );
        $users                = $query->get_results();
        $total                = (int) $query->get_total();
        $total_pages          = $total > 0 ? (int) ceil( $total / $per_page ) : 0;
        $stats_map            = self::get_bulk_wholesaler_order_stats( wp_list_pluck( $users, 'ID' ) );
        $wholesalers_response = self::make_wholesaler_response( $users, $wholesale_slugs, $stats_map );
        return [
            'currentPage' => $page,
            'totalPage'   => $total_pages,
            'totalItems'  => $total,
            'data'        => $wholesalers_response,
        ];
    }

    /**
     * Get the bulk order stats of wholesalers.
     *
     * @param array $user_ids The user ids.
     * @return array The bulk order stats.
     */
    public static function get_bulk_wholesaler_order_stats( array $user_ids ): array {

        if ( empty( $user_ids ) ) {
            return [];
        }

        global $wpdb;

        $stats = [];

        foreach ( $user_ids as $user_id ) {
            $stats[ (int) $user_id ] = [
                'completed_orders' => 0,
                'revenue'          => 0,
            ];
        }

        $placeholders = implode( ',', array_fill( 0, count( $user_ids ), '%d' ) );

        $is_hpos = OrderUtil::custom_orders_table_usage_is_enabled();
        if ( $is_hpos ) {
            $sql_query = "SELECT o.customer_id,COUNT(o.id) AS completed_orders,SUM(o.total_amount) AS revenue
                FROM {$wpdb->prefix}wc_orders o
                INNER JOIN {$wpdb->prefix}wc_orders_meta wm ON wm.order_id = o.id AND wm.meta_key = '_ywhs_wholesale_role' AND wm.meta_value <> ''
                WHERE o.status = 'wc-completed' AND o.customer_id IN ($placeholders)
                GROUP BY o.customer_id";
        } else {
            $sql_query = "SELECT customer.meta_value AS customer_id,COUNT(p.ID) AS completed_orders,SUM(total.meta_value) AS revenue
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->postmeta} customer ON customer.post_id = p.ID AND customer.meta_key = '_customer_user'
                INNER JOIN {$wpdb->postmeta} total ON total.post_id = p.ID AND total.meta_key = '_order_total'
                INNER JOIN {$wpdb->postmeta} wholesale ON wholesale.post_id = p.ID AND wholesale.meta_key = '_ywhs_wholesale_role' AND wholesale.meta_value <> ''
                WHERE p.post_type = 'shop_order' AND p.post_status = 'wc-completed' AND customer.meta_value IN ($placeholders)
                GROUP BY customer.meta_value";
        }

        $sql_query = apply_filters( 'ywhs_wholesaler_stats_sql_query', $sql_query, $user_ids, $is_hpos );

        $rows = $wpdb->get_results( $wpdb->prepare( $sql_query, ...$user_ids ), ARRAY_A );

        foreach ( $rows as $row ) {
            $stats[ (int) $row['customer_id'] ] = [
                'completed_orders' => (int) $row['completed_orders'],
                'revenue'          => (float) $row['revenue'],
            ];
        }

        return $stats;
    }

    /**
     * Build the search args.
     *
     * @param string $search The search keyword.
     * @return array The search args.
     */
    protected static function build_search_args( string $search = '' ): array {
        if ( empty( $search ) ) {
            return [];
        }

        if ( is_numeric( $search ) ) {
            return [
                'include' => [ intval( $search ) ],
            ];
        }

        return [
            'search'         => esc_attr( '*' . $search . '*' ),
            'search_columns' => [ 'user_login', 'user_nicename', 'user_email', 'display_name' ],
        ];
    }

    /**
     * Get the wholesale role slug.
     *
     * @param array $user_roles The user roles.
     * @return string The wholesale slug.
     */
    public static function get_wholesale_role_slug( array $user_roles ): string {

        if ( empty( $user_roles ) ) {
            return '';
        }

        if ( count( $user_roles ) === 1 ) {
            return reset( $user_roles );
        }

        $roles_option    = get_option( 'yaywholesaleb2b_roles', [] );
        $wholesale_slugs = array_filter( array_map( fn( $r ) => $r['slug'] ?? null, $roles_option ) );
        $matched         = array_values( array_intersect( $user_roles, $wholesale_slugs ) );
        return reset( $matched ) ?? '';
    }

    /**
     * Parse wholesaler to resonse format.
     *
     * @param array $users The users data.
     * @param array $wholesale_slugs The wholesale role slugs.
     * @param array $stats_map The stats map.
     * @return array The cleaned wholesalers data.
     */
    public static function make_wholesaler_response( array $users, array $wholesale_slugs, array $stats_map ): array {

        $cleaned_users = array_map(
            static function ( \WP_User $user ) use ( $wholesale_slugs, $stats_map ) {
                $wholesale_role_slug = current( array_intersect( $user->roles, $wholesale_slugs ) );

                $stats = $stats_map[ $user->ID ] ?? [
                    'completed_orders' => 0,
                    'revenue'          => 0,
                ];

                return [
                    'id'                   => (int) $user->ID,
                    'userName'             => $user->user_login ?? '',
                    'firstName'            => $user->first_name ?? '',
                    'lastName'             => $user->last_name ?? '',
                    'displayName'          => $user->display_name ?? '',
                    'avatar'               => get_avatar_url( $user->ID ),
                    'email'                => $user->user_email ?? '',

                    'wholesaleRoleSlug'    => $wholesale_role_slug ?? '',
                    'completedOrdersCount' => (int) $stats['completed_orders'],
                    'wholesaleRevenue'     => (float) $stats['revenue'],
                ];
            },
            $users
        );

        return array_values( $cleaned_users );
    }
}
