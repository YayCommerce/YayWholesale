<?php
namespace Yay_Wholesale\Helpers;

/**
 * Roles Helper Class
 */
class RolesHelper {
    /**
     * Check if the user is a wholesale user.
     *
     * @param int|null $user_id The user ID.
     * @return array|null The wholesale role array or null if not found.
     */
    public static function is_wholesale_user( ?int $user_id = null ): ?array {
        $user = $user_id
            ? get_user_by( 'id', $user_id )
            : ( is_user_logged_in() ? wp_get_current_user() : null );

        if ( ! $user?->exists() ) {
            return null;
        }

        $roles = get_option( 'yay_wholesale_roles', [] );
        if ( empty( $roles ) ) {
            return null;
        }

        $user_role_slug = self::get_user_wholesale_role( $user, $roles );
        return $user_role_slug ? self::get_role_by_slug( $roles, $user_role_slug ) : null;
    }

    /**
     * Generate a unique and sanitized role slug from the role name, avoiding duplicates in provided roles array.
     *
     * @param string  $name  The role name to use as the base slug.
     * @param array[] $roles Existing roles array (with 'slug' keys) to check for uniqueness.
     * @return string Unique, sanitized role slug.
     */
    public static function generate_unique_role_slug( string $name, array $roles ): string {
        $base_slug      = sanitize_title( $name );
        $existing_slugs = array_column( $roles, 'slug' );

        // If clean base is unique, return it directly for clarity.
        if ( ! in_array( $base_slug, $existing_slugs, true ) ) {
            return $base_slug;
        }

        // Otherwise, increment a suffix until uniqueness is found.
        $index = 2;
        do {
            $candidate = "{$base_slug}-{$index}";
            ++$index;
        } while ( in_array( $candidate, $existing_slugs, true ) );

        return $candidate;
    }

    /**
     * Remove a WordPress role by its slug if it exists.
     *
     * @param string $slug The role slug.
     * @return void
     */
    public static function remove_wp_role_by_slug( string $slug ): void {
        $wp_roles = wp_roles();

        if ( ! $slug || ! is_string( $slug ) ) {
            return;
        }

        if ( $wp_roles->is_role( $slug ) ) {
            $wp_roles->remove_role( $slug );
        }
    }

    /**
     * Retrieve a single role config array by its slug, or null if not found.
     *
     * @param array[] $roles Array of role config arrays (must include 'slug').
     * @param string  $slug  The role slug to search for (compared in sanitized form).
     * @return array|null    The matched role config or null if not found.
     */
    public static function get_role_by_slug( array $roles, string $slug ): ?array {
        $slug = sanitize_title( $slug );
        foreach ( $roles as $role ) {
            if ( isset( $role['slug'] ) && sanitize_title( $role['slug'] ) === $slug ) {
                return $role;
            }
        }
        return null;
    }

    /**
     * Get the wholesale role slug for a user, checking user meta first, then WP roles.
     *
     * @param \WP_User $user  The WP_User object.
     * @param array[]  $roles Array of available role configs (must include 'slug').
     * @return string|null    The found wholesale role slug or null if not found.
     */
    public static function get_user_wholesale_role( \WP_User $user, array $roles ): ?string {
        if ( ! ( $user instanceof \WP_User ) ) {
            return null;
        }

        $meta_slug = sanitize_title( (string) get_user_meta( $user->ID, '_yay_wholesale_role', true ) );
        if ( ! empty( $meta_slug ) ) {
            return $meta_slug;
        }

        if ( ! empty( $user->roles ) && is_array( $user->roles ) ) {
            foreach ( $user->roles as $wp_role ) {
                $role = self::get_role_by_slug( $roles, $wp_role );
                if ( ! empty( $role['slug'] ) ) {
                    return $role['slug'];
                }
            }
        }

        return null;
    }
}
