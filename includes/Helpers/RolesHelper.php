<?php
namespace Yay_Wholesale\Helpers;

/**
 * Roles Helper Class
 */
class RolesHelper {
    public static function is_wholesale_user( int $user_id = 0 ): array|null {
        if ( ! is_user_logged_in() ) {
            return null;
        }

        $roles          = get_option( 'yay_wholesale_roles', [] );
        $user           = $user_id > 0 ? get_user_by( 'ID', $user_id ) : wp_get_current_user();
        $user_role_slug = self::get_user_wholesale_role( $user, $roles );
        if ( ! $user_role_slug ) {
            return null;
        }

        $role = self::get_role_by_slug( $roles, $user_role_slug );
        if ( ! $role || ! isset( $role['status'] ) || ! $role['status'] ) {
            return null;
        }

        return $role;
    }

    /**
     * Generate a unique role slug.
     *
     * @param string  $name The role name.
     * @param array[] $roles The roles array.
     * @return string The unique role slug.
     */
    public static function generate_unique_role_slug( string $name, array $roles ): string {
        $base  = sanitize_title( $name );
        $slugs = array_column( $roles, 'slug' );
        $slug  = $base;
        $i     = 1;
        while ( in_array( $slug, $slugs, true ) ) {
            $slug = "{$base}-{$i}";
            ++$i;
        }
        return $slug;
    }


    /**
     * Remove a WordPress role by slug.
     *
     * @param string $slug The role slug.
     * @return void
     */
    public static function remove_wp_role_by_slug( string $slug ): void {
        $wp_roles = wp_roles();
        if ( $wp_roles->is_role( $slug ) ) {
            $wp_roles->remove_role( $slug );
        }
    }

    /**
     * Get role config by slug.
     *
     * @param array[] $roles The roles array.
     * @param string  $slug The role slug.
     * @return array|null The role config or null if not found.
     */
    public static function get_role_by_slug( array $roles, string $slug ): ?array {
        return array_values( array_filter( $roles, fn( $role ) => isset( $role['slug'] ) && $role['slug'] === $slug ) )[0] ?? null;
    }

    /**
     * Get the wholesale role slug for the current user.
     *
     * @param \WP_User $user The user object.
     * @param array[]  $roles The roles array.
     * @return string|null The wholesale role slug or null if not found.
     */
    public static function get_user_wholesale_role( \WP_User $user, array $roles ): ?string {
        $meta_slug = get_user_meta( $user->ID, '_yay_wholesale_role', true );
        if ( $meta_slug ) {
            return sanitize_title( $meta_slug );
        }

        // Fallback to WP role if slug matches
        foreach ( $user->roles as $wp_role ) {
            $role = self::get_role_by_slug( $roles, $wp_role );
            if ( $role ) {
                return $role['slug'];
            }
        }

        return null;
    }

    /**
     * Delete all the yay-wholesale's roles from the user.
     *
     * @param \WP_User $user The user object.
     * @return void
     */
    public static function remove_ywhs_role_from_user( \WP_User $user ): void {
        $role_slugs = array_column( get_option( 'yay_wholesale_roles', [] ), 'slug' );

        foreach ( $role_slugs as $ywhs_role ) {
            if ( in_array( $ywhs_role, $user->roles, true ) ) {
                $user->remove_role( $ywhs_role );
            }
        }
    }
}
