<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Helpers\SettingsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Refactor note: API controller.
 * 1. create one. success return created item
 * 2. update one. error 404, success return updated item
 * 3. delete one. error 404, success return true
 * 4. bulk update/delete: return number of affected items
 */

/**
 * Handles Roles management endpoints.
 */
class RolesRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        // GET /roles, POST /roles
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

        // Bulk delete
        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/bulk',
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_roles_bulk' ],
                'permission_callback' => [ $this, 'can_manage_roles' ],
            ]
        );

        // Bulk status update
        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/bulk-status',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'bulk_update_role_status' ],
                'permission_callback' => [ $this, 'can_manage_roles' ],
            ]
        );

        // Single role
        register_rest_route(
            self::REST_NAMESPACE,
            '/roles/(?P<roleId>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_role' ],
                    'permission_callback' => [ $this, 'can_get_roles' ],
                ],
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
    }

    /**
     * Get the list of roles.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_roles( WP_REST_Request $request ): WP_REST_Response {
        $roles    = get_option( 'yaywholesaleb2b_roles', [] );
        $settings = SettingsHelper::get_settings();

        $active_filter = $request->get_param( 'active' );

        if ( isset( $active_filter ) ) {
            $roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] === (bool) $active_filter ) );
        }

        $handled_roles = RolesHelper::handle_roles_data( $roles, $settings );

        return $this->success( $handled_roles );
    }

    /**
     * Get a role by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_role( WP_REST_Request $request ): WP_REST_Response {
        $role_id = (int) $request->get_param( 'roleId' );
        $roles   = get_option( 'yaywholesaleb2b_roles', [] );

        $role = array_values( array_filter( $roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $role_id ) )[0] ?? null;

        if ( ! $role ) {
            return $this->error( __( 'Role not found', 'yay-wholesale-b2b' ), 404 );
        }

        return $this->success( $role );
    }

    /**
     * Create a new role.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function create_role( WP_REST_Request $request ): WP_REST_Response {
        $params    = $this->get_json_params( $request );
        $role_name = sanitize_text_field( $params['name'] ?? '' );

        if ( ! $role_name ) {
            return $this->error( __( 'Missing role name', 'yay-wholesale-b2b' ) );
        }

        $roles = get_option( 'yaywholesaleb2b_roles', [] );
        $slug  = RolesHelper::generate_unique_role_slug( $role_name, $roles );

        if ( ! get_role( $slug ) ) {
            add_role( $slug, $role_name, [ 'read' => true ] );
        }

        $new_role = array_merge(
            $params,
            [
                'id'   => $roles ? max( array_column( $roles, 'id' ) ) + 1 : 1,
                'slug' => $slug,
            ]
        );

        $roles[] = $new_role;
        RolesHelper::save_wholesale_roles( $roles );

        return $this->success( $new_role, __( 'Role created successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Update a role.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_role( WP_REST_Request $request ): WP_REST_Response {
        $params       = $this->get_json_params( $request );
        $role_id      = (int) $request->get_param( 'roleId' );
        $roles        = get_option( 'yaywholesaleb2b_roles', [] );
        $updated_role = false;

        foreach ( $roles as $key => $role ) {
            if ( (int) ( $role['id'] ?? 0 ) === $role_id ) {
                $updated_role  = array_merge( $role, $params );
                $roles[ $key ] = $updated_role;
            }
        }

        if ( $updated_role === false ) {
            return $this->error( __( 'Role not found', 'yay-wholesale-b2b' ), 404 );
        }

        RolesHelper::save_wholesale_roles( $roles );

        return $this->success( $updated_role, __( 'Role updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Delete a role.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_role( WP_REST_Request $request ): WP_REST_Response {
        $role_id      = (int) $request->get_param( 'roleId' );
        $roles        = get_option( 'yaywholesaleb2b_roles', [] );
        $deleted_role = false;

        foreach ( $roles as $key => $role ) {
            if ( (int) ( $role['id'] ?? 0 ) === $role_id ) {
                $deleted_role = $role;
                RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                unset( $roles[ $key ] );
            }
        }

        if ( $deleted_role === false ) {
            return $this->error( __( 'Role not found', 'yay-wholesale-b2b' ), 404 );
        }

        update_option( 'yaywholesaleb2b_roles', array_values( $roles ) );

        return $this->success( true, __( 'Role deleted successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Delete multiple roles.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_roles_bulk( WP_REST_Request $request ): WP_REST_Response {
        $ids                = array_map( 'intval', (array) $request->get_param( 'ids' ) );
        $roles              = get_option( 'yaywholesaleb2b_roles', [] );
        $deleted_role_count = 0;

        foreach ( $roles as $key => $role ) {
            if ( in_array( (int) ( $role['id'] ?? 0 ), $ids, true ) ) {
                ++$deleted_role_count;
                RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                unset( $roles[ $key ] );
            }
        }

        update_option( 'yaywholesaleb2b_roles', array_values( $roles ) );

        return $this->success( $deleted_role_count, __( 'Roles deleted successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Bulk update the status of multiple roles.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_update_role_status( WP_REST_Request $request ): WP_REST_Response {
        $params = $this->get_json_params( $request );
        $ids    = $params['ids'] ?? [];
        $status = $params['status'] ?? null;

        if ( empty( $ids ) || ! is_bool( $status ) ) {
            return $this->error( __( 'Invalid parameters', 'yay-wholesale-b2b' ) );
        }

        $roles         = get_option( 'yaywholesaleb2b_roles', [] );
        $updated_count = 0;

        foreach ( $roles as &$role ) {
            if ( in_array( (int) $role['id'], $ids, true ) ) {
                $role['status'] = $status;
                ++$updated_count;
            }
        }

        RolesHelper::save_wholesale_roles( $roles );
        return $this->success( $updated_count, __( 'Statuses updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Check if the user has the necessary permissions to access the roles endpoints (action: get, search).
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_manage_roles() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Check if the user has the necessary permissions to access the roles endpoints (actions: get, search).
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_get_roles() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }
}
