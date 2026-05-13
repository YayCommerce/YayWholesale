<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;

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
                'paged'    => $page,
                'fields'   => 'all_with_meta',
            ],
            self::build_search_args( $search )
        );

        $query       = new \WP_User_Query( $query_args );
        $users       = $query->get_results();
        $total       = (int) $query->get_total();
        $total_pages = max( 1, ceil( $total / $per_page ) );

        $wholesalers_response = self::make_wholesaler_response( $users, $wholesale_slugs );

        return [
            'currentPage' => $page,
            'totalPage'   => $total_pages,
            'totalItems'  => $total,
            'data'        => $wholesalers_response,
        ];
    }

    /**
     * Get the order stats of a wholesaler.
     *
     * @param int $user_id The user id.
     * @return array The order stats.
     */
    public static function get_wholesaler_order_stats( int $user_id ): array {

        $orders = wc_get_orders(
            [
                'limit'      => -1,
                'status'     => 'completed',
                'meta_query' => [
                    [
                        'key'     => '_ywhs_wholesale_role',
                        'compare' => 'EXISTS',
                    ],
                ],
                'return'     => 'objects',
            ]
        );

        $completed_orders = 0;
        $revenue          = 0.0;

        foreach ( $orders as $order ) {

            if ( $order->get_user_id() === $user_id ) {
                ++$completed_orders;
                $revenue += (float) $order->get_total();
            }
        }

        return [
            'completed_orders' => $completed_orders,
            'revenue'          => $revenue,
        ];
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
     * @return array The cleaned wholesalers data.
     */
    public static function make_wholesaler_response( array $users, array $wholesale_slugs ): array {
        $cleaned_users = array_map(
            function ( \WP_User $user ) use ( $wholesale_slugs ) {
                // TODO: Optimize N+1 Query
                $stats               = self::get_wholesaler_order_stats( (int) $user->ID );
                $wholesale_role_slug = current( array_intersect( $user->roles, $wholesale_slugs ) );

                return [
                    'id'                   => (int) $user->ID,
                    'userName'             => $user->user_login ?? '',
                    'firstName'            => $user->first_name ?? '',
                    'lastName'             => $user->last_name ?? '',
                    'displayName'          => $user->display_name ?? '',
                    'avatar'               => get_avatar_url( $user->ID ),
                    'email'                => $user->user_email ?? '',

                    'wholesaleRoleSlug'    => $wholesale_role_slug ?? '',
                    'completedOrdersCount' => $stats['completed_orders'],
                    'wholesaleRevenue'     => $stats['revenue'],
                ];
            },
            $users
        );
        return array_values( $cleaned_users );
    }
}
