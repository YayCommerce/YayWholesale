<?php
namespace Yay_Wholesale\Helpers;

/**
 * Roles Helper Class
 */
class RolesHelper {

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
}
