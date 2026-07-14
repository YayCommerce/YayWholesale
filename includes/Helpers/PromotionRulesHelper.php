<?php
namespace YayWholesaleB2B\Helpers;

use Automattic\WooCommerce\Utilities\OrderUtil;
/**
 * Promotion Rules Helper Class
 */
class PromotionRulesHelper {

    /**
     * Conditions that compare yearly spend, only applicable once per year (January).
     */
    const YEARLY_CONDITIONS = [ 'last-year-spend-at-least', 'last-year-spend-less-than' ];

    /**
     * Cron entry point: evaluate promotion rules for the current month.
     *
     * @return void
     */
    public static function evaluate_promotion_rules(): void {
        // Only run on the first day of the month
        if ( (int) wp_date( 'j' ) !== 1 ) {
            return;
        }

        $rules = self::get_applicable_rules();

        if ( empty( $rules ) ) {
            return;
        }

        // Get all eligible user IDs to evaluate the promotion rules.
        $user_ids = self::get_eligible_user_ids();

        foreach ( $user_ids as $user_id ) {
            $user = get_user_by( 'ID', (int) $user_id );
            if ( ! ( $user instanceof \WP_User ) ) {
                continue;
            }
            self::evaluate_user( $user, $rules );
        }
    }

    /**
     * Get all eligible user IDs.
     *
     * @return int[]
     */
    public static function get_eligible_user_ids(): array {
        $roles = array_merge(
            [ 'customer' ],
            array_column( RolesHelper::get_wholesale_roles(), 'slug' )
        );

        return get_users(
            [
                'fields'   => 'ids',
                'role__in' => $roles,
            ]
        );
    }

    /**
     * Load enabled promotion rules applicable to the current month.
     *
     * @return array
     */
    protected static function get_applicable_rules(): array {
        $settings = SettingsHelper::get_settings();
        $rules    = $settings['promotion_rules']['promotionRules'] ?? [];

        if ( ! is_array( $rules ) ) {
            return [];
        }

        $rules = array_values(
            array_filter( $rules, fn( $rule ) => is_array( $rule ) && ! empty( $rule['enableStatus'] ) )
        );

        if ( (int) wp_date( 'n' ) !== 1 ) {
            $rules = array_values(
                array_filter( $rules, fn( $rule ) => ! in_array( $rule['condition'] ?? null, self::YEARLY_CONDITIONS, true ) )
            );
        }

        return $rules;
    }

    /**
     * Evaluate rules in array order for a user; apply the first match and stop.
     *
     * @param \WP_User $user The user.
     * @param array    $rules The applicable rules.
     * @return void
     */
    protected static function evaluate_user( \WP_User $user, array $rules ): void {
        $spend = null;

        foreach ( $rules as $rule ) {
            if ( ! is_array( $rule ) ) {
                continue;
            }

            $from_roles = $rule['fromRoles'] ?? null;

            if ( ! is_array( $from_roles ) || ! self::user_matches_from_roles( $user, $from_roles ) ) {
                continue;
            }

            if ( $spend === null ) {
                $spend = self::get_user_spend( $user->ID );
            }

            if ( self::rule_matches_condition( $rule, $spend ) ) {
                $new_role = $rule['newRole'] ?? null;

                if ( is_array( $new_role ) ) {
                    self::apply_new_role( $user, $new_role );
                }

                break;
            }
        }//end foreach
    }

    /**
     * Check whether the user's current role matches the rule's fromRoles setting.
     *
     * @param \WP_User $user The user.
     * @param array    $from_roles The fromRoles config.
     * @return bool
     */
    protected static function user_matches_from_roles( \WP_User $user, array $from_roles ): bool {
        $wholesale_role = CustomerHelper::get_wholesale_role( $user );

        if ( $wholesale_role === null ) {
            $retailers_setting = ! empty( $from_roles['retailers'] ) ? $from_roles['retailers'] : 'disabled';
            return 'enabled' === $retailers_setting;
        }

        $wholesalers_setting = ! empty( $from_roles['wholesalers'] ) ? $from_roles['wholesalers'] : 'disabled';

        if ( 'enabled' === $wholesalers_setting ) {
            return true;
        }

        if ( 'enabled-selected-roles' === $wholesalers_setting ) {
            $selected_roles = $from_roles['selected_roles'] ?? [];
            return in_array( $wholesale_role['slug'], $selected_roles, true );
        }

        return false;
    }

    /**
     * Check whether the rule's spend condition is met.
     *
     * @param array $rule The rule.
     * @param array $spend The user's spend data.
     * @return bool
     */
    protected static function rule_matches_condition( array $rule, array $spend ): bool {
        $amount               = (float) ( $rule['conditionAmount'] ?? 0 );
        $condition            = $rule['condition'] ?? '';
        $has_completed_orders = (int) ( $spend['completed_orders'] ?? 0 ) > 0;

        switch ( $condition ) {
            case 'total-spend-at-least':
                return $spend['total'] >= $amount;
            case 'last-year-spend-at-least':
                return $spend['last_year'] >= $amount;
            case 'last-year-spend-less-than':
                return $has_completed_orders && $spend['last_year'] < $amount;
            case 'last-month-spend-at-least':
                return $spend['last_month'] >= $amount;
            case 'last-month-spend-less-than':
                return $has_completed_orders && $spend['last_month'] < $amount;
            default:
                return false;
        }
    }

    /**
     * Apply the rule's target role to the user.
     *
     * Skips the write entirely if the user is already on the target role, and
     * validates the target role before making any change so an invalid/malformed
     * slug never strips the user's existing role.
     *
     * @param \WP_User $user The user.
     * @param array    $new_role The newRole tuple, e.g. ['wholesalers', 'gold_wholesale'].
     * @return void
     */
    protected static function apply_new_role( \WP_User $user, array $new_role ): void {
        $type      = $new_role[0] ?? null;
        $role_slug = (string) ( $new_role[1] ?? '' );

        if ( ! in_array( $type, [ 'retailers', 'wholesalers' ], true ) ) {
            return;
        }

        $all_wholesale_slugs     = array_column( RolesHelper::get_wholesale_roles(), 'slug' );
        $current_wholesale_slugs = array_values( array_intersect( $user->roles, $all_wholesale_slugs ) );

        if ( 'retailers' === $type ) {
            // Already a retailer — nothing to change.
            if ( empty( $current_wholesale_slugs ) ) {
                return;
            }
            // Remove the user's current wholesale roles.
            RolesHelper::remove_ywhs_role_from_user( $user );
            return;
        }

        // Get the role by slug.
        $role = RolesHelper::get_role_by_slug( RolesHelper::get_wholesale_roles(), $role_slug );
        // Invalid target role slug — skip without touching the user's current roles.
        if ( empty( $role ) ) {
            return;
        }
        // Already on the target role — nothing to change.
        if ( in_array( $role['slug'], $current_wholesale_slugs, true ) ) {
            return;
        }

        // Remove the user's current wholesale roles.
        RolesHelper::remove_ywhs_role_from_user( $user );
        // Add the new role to the user.
        $user->add_role( $role['slug'] );
    }

    /**
     * Get a user's completed-order statistics.
     *
     * Returns the customer's completed order count together with
     * total spend, last calendar year spend, and last calendar month spend.
     *
     * @param int $user_id The user ID.
     * @return array{
     *     completed_orders:int,
     *     total:float,
     *     last_year:float,
     *     last_month:float
     * }
     */
    public static function get_user_spend( int $user_id ): array {
        global $wpdb;

        $timezone = wp_timezone();
        $now      = new \DateTime( 'now', $timezone );

        $this_month_start = new \DateTime( $now->format( 'Y-m-01 00:00:00' ), $timezone );
        $last_month_start = ( clone $this_month_start )->modify( '-1 month' );

        $this_year_start = new \DateTime( $now->format( 'Y-01-01 00:00:00' ), $timezone );
        $last_year_start = ( clone $this_year_start )->modify( '-1 year' );

        if ( OrderUtil::custom_orders_table_usage_is_enabled() ) {
            $sql_query = "SELECT 
                    COUNT(o.id) AS completed_orders,
                    COALESCE(SUM(o.total_amount), 0) AS total,
                    COALESCE( SUM( CASE WHEN od.date_completed_gmt >= %s AND od.date_completed_gmt < %s THEN o.total_amount ELSE 0 END),0) AS last_year,
                    COALESCE( SUM( CASE WHEN od.date_completed_gmt >= %s AND od.date_completed_gmt < %s THEN o.total_amount ELSE 0 END ),  0 ) AS last_month
                FROM {$wpdb->prefix}wc_orders o
                INNER JOIN {$wpdb->prefix}wc_order_operational_data od ON od.order_id = o.id
                WHERE o.status = 'wc-completed' AND o.customer_id = %d";

            $params = [
                gmdate( 'Y-m-d H:i:s', $last_year_start->getTimestamp() ),
                gmdate( 'Y-m-d H:i:s', $this_year_start->getTimestamp() ),
                gmdate( 'Y-m-d H:i:s', $last_month_start->getTimestamp() ),
                gmdate( 'Y-m-d H:i:s', $this_month_start->getTimestamp() ),
                $user_id,
            ];
        } else {

            $sql_query = "SELECT
                COUNT(p.ID) AS completed_orders,
                COALESCE(SUM(CAST(total.meta_value AS DECIMAL(20,4))), 0) AS total,
                COALESCE(SUM(CASE WHEN completed.meta_value >= %d AND completed.meta_value < %d THEN CAST(total.meta_value AS DECIMAL(20,4)) ELSE 0 END ), 0) AS last_year,
                COALESCE(SUM( CASE WHEN completed.meta_value >= %d AND completed.meta_value < %d THEN CAST(total.meta_value AS DECIMAL(20,4)) ELSE 0 END),0) AS last_month
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->postmeta} customer ON customer.post_id = p.ID AND customer.meta_key = '_customer_user'
    
                INNER JOIN {$wpdb->postmeta} total ON total.post_id = p.ID AND total.meta_key = '_order_total'
    
                LEFT JOIN {$wpdb->postmeta} completed ON completed.post_id = p.ID AND completed.meta_key = '_date_completed'
                WHERE p.post_type = 'shop_order' AND p.post_status = 'wc-completed' AND customer.meta_value = %d";

            $params = [
                $last_year_start->getTimestamp(),
                $this_year_start->getTimestamp(),
                $last_month_start->getTimestamp(),
                $this_month_start->getTimestamp(),
                $user_id,
            ];
        }//end if

        $row = $wpdb->get_row(
            $wpdb->prepare( $sql_query, ...$params ),
            ARRAY_A
        );

        return [
            'completed_orders' => (int) ( $row['completed_orders'] ?? 0 ),
            'total'            => (float) ( $row['total'] ?? 0 ),
            'last_year'        => (float) ( $row['last_year'] ?? 0 ),
            'last_month'       => (float) ( $row['last_month'] ?? 0 ),
        ];
    }
}
