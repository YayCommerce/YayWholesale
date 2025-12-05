<?php
namespace Yay_Wholesale\Helpers;

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
     * @param string $role The role slug.
     * @return array The list of wholesalers.
     */
    public static function get_wholesalers_list( string $search = '', int $page = 1, int $per_page = 10, string $role = '' ): array {
        $roles = get_option( 'yay_wholesale_roles', [] );

        if ( empty( $roles ) ) {
            return [
                'currentPage' => $page,
                'totalPage'   => 0,
                'totalItems'  => 0,
                'data'        => [],
            ];
        }

        $wholesale_slugs = array_filter(
            array_map( fn( $r ) => $r['slug'] ?? null, $roles )
        );

        if ( ! empty( $role ) && 'all' !== $role ) {
            $wholesale_slugs = [ $role ];
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

        return [
            'currentPage' => $page,
            'totalPage'   => $total_pages,
            'totalItems'  => $total,
            'data'        => self::clean_wholesalers_data( $users ),
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
                'meta_key'   => 'yay_wholesale',
                'meta_value' => 'yes',
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
     * Clean the wholesalers data.
     *
     * @param array $users The users data.
     * @return array The cleaned wholesalers data.
     */
    public static function clean_wholesalers_data( array $users ): array {
        $cleaned_users = array_map(
            function ( \WP_User $user ) {
                $stats = self::get_wholesaler_order_stats( (int) $user->ID );
                return [
                    'id'                   => (int) $user->ID,
                    'role'                 => reset( $user->roles ) ?? '',
                    'userName'             => $user->user_login ?? '',
                    'firstName'            => $user->first_name ?? '',
                    'lastName'             => $user->last_name ?? '',
                    'displayName'          => $user->display_name ?? '',
                    'avatar'               => get_avatar_url( $user->ID ),
                    'email'                => $user->user_email ?? '',
                    'completedOrdersCount' => $stats['completed_orders'],
                    'wholesaleRevenue'     => $stats['revenue'],
                ];
            },
            $users
        );
        return array_values( $cleaned_users );
    }
}
