<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Utils\Utils;

/**
 * Roles Helper Class
 */
class CustomerHelper {

    /**
     * Check if the user is a wholesale customer.
     *
     * @param \WP_User $user The user object.
     * @return boolean The user object.
     */
    public static function is_wholesale_customer( \WP_User $user ) {
        $wholesale_role = self::get_wholesale_role( $user );
        if ( $wholesale_role === null ) {
            return false;
        }

        return true;
    }

    /**
     * Get wholesale role config.
     *
     * @param \WP_User $user The user object.
     * @return array|null
     */
    public static function get_wholesale_role( \WP_User $user ) {
        $wholesale_roles = RolesHelper::get_active_wholesale_roles();

        foreach ( $user->roles as $wp_role ) {
            $found_role = RolesHelper::get_role_by_slug( $wholesale_roles, $wp_role );

            if ( $found_role !== null ) {

                return $found_role;
            }
        }

        return null;
    }

    /**
     * Check if the current user is a wholesale customer.
     *
     * @return boolean The user object.
     */
    public static function is_current_wholesale_customer() {
        $current_user = wp_get_current_user();
        return self::is_wholesale_customer( $current_user );
    }

    /**
     * Get current user's wholesale role config.
     *
     * @return array|null
     */
    public static function get_current_user_wholesale_role() {
        $current_user = wp_get_current_user();
        return self::get_wholesale_role( $current_user );
    }
}
