<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Roles management endpoints.
 */
class RolesRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/roles',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_roles' ],
                    'permission_callback' => [ $this, 'can_get_roles' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_role' ],
                    'permission_callback' => [ $this, 'can_manage_roles' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/(?P<roleId>\d+)',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_role' ],
                    'permission_callback' => [ $this, 'can_manage_roles' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_role' ],
                    'permission_callback' => [ $this, 'can_manage_roles' ],
                ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/bulk-delete',
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'bulk_delete_roles' ],
                'permission_callback' => [ $this, 'can_manage_roles' ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/bulk-status',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'bulk_update_role_status' ],
                'permission_callback' => [ $this, 'can_manage_roles' ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/count-users',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'count_users_by_roles' ],
                    'permission_callback' => [ $this, 'can_manage_roles' ],
                ],
            ]
        );
    }

    public function get_roles() {
        return RolesHelper::get_wholesale_roles();
    }

    public function create_role( WP_REST_Request $request ) {
        $payload   = $request->get_json_params();
        $role_name = sanitize_text_field( $payload['name'] ?? '' );

        if ( ! $role_name ) {
            return $this->error_invalid_arguments();
        }

        $roles = RolesHelper::get_wholesale_roles();
        $slug  = RolesHelper::generate_unique_role_slug( $role_name, $roles );

        if ( ! get_role( $slug ) ) {
            add_role( $slug, $role_name, [ 'read' => true ] );
        }

        $new_role = array_merge(
            $payload,
            [
                'id'   => $roles ? max( array_column( $roles, 'id' ) ) + 1 : 1,
                'slug' => $slug,
            ]
        );
        $roles[]  = $new_role;

        RolesHelper::save_wholesale_roles( $roles );
        return RolesHelper::get_wholesale_roles();
    }

    public function update_role( WP_REST_Request $request ) {
        $payload      = $request->get_json_params();
        $role_id      = (int) $request->get_param( 'roleId' );
        $roles        = RolesHelper::get_wholesale_roles();
        $updated_role = false;

        foreach ( $roles as $key => $role ) {
            if ( (int) ( $role['id'] ?? 0 ) === $role_id ) {
                $updated_role  = array_merge( $role, $payload );
                $roles[ $key ] = $updated_role;
            }
        }

        if ( $updated_role === false ) {
            return $this->error_not_found();
        }

        RolesHelper::save_wholesale_roles( $roles );
        return RolesHelper::get_wholesale_roles();
    }

    public function delete_role( WP_REST_Request $request ) {
        $role_id      = (int) $request->get_param( 'roleId' );
        $roles        = RolesHelper::get_wholesale_roles();
        $deleted_role = false;

        foreach ( $roles as $key => $role ) {
            if ( (int) ( $role['id'] ?? 0 ) === $role_id ) {
                $deleted_role = $role;
                RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                unset( $roles[ $key ] );
            }
        }

        if ( $deleted_role === false ) {
            return $this->error_not_found();
        }

        RolesHelper::save_wholesale_roles( array_values( $roles ) );
        return RolesHelper::get_wholesale_roles();
    }

    public function bulk_delete_roles( WP_REST_Request $request ) {
        $payload = $request->get_json_params();
        $ids     = $payload['ids'] ?? [];

        if ( empty( $ids ) ) {
            return $this->error_invalid_arguments();
        }

        $roles              = RolesHelper::get_wholesale_roles();
        $deleted_role_count = 0;

        foreach ( $roles as $key => $role ) {
            if ( in_array( (int) ( $role['id'] ?? 0 ), $ids, true ) ) {
                ++$deleted_role_count;
                RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                unset( $roles[ $key ] );
            }
        }

        RolesHelper::save_wholesale_roles( array_values( $roles ) );
        return RolesHelper::get_wholesale_roles();
    }

    public function bulk_update_role_status( WP_REST_Request $request ) {
        $payload = $request->get_json_params();
        $ids     = $payload['ids'] ?? [];
        $status  = $payload['status'] ?? null;

        if ( empty( $ids ) || ! is_bool( $status ) ) {
            return $this->error_invalid_arguments();
        }

        $roles         = RolesHelper::get_wholesale_roles();
        $updated_count = 0;

        foreach ( $roles as &$role ) {
            if ( in_array( (int) $role['id'], $ids, true ) ) {
                $role['status'] = $status;
                ++$updated_count;
            }
        }

        RolesHelper::save_wholesale_roles( $roles );
        return RolesHelper::get_wholesale_roles();
    }

    public function count_users_by_roles() {
        $roles        = RolesHelper::get_wholesale_roles();
        $users_counts = [ 'noop' => 0 ];

        foreach ( $roles as $role ) {
            $users_counts[ $role['slug'] ] = RolesHelper::count_users_by_role( $role['slug'] );
        }

        return $users_counts;
    }

    public function can_manage_roles() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }

    public function can_get_roles() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
