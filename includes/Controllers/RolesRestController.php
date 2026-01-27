<?php
namespace Yay_Wholesale_B2B\Controllers;

use Yay_Wholesale_B2B\Utils\SingletonTrait;
use Yay_Wholesale_B2B\Helpers\RolesHelper;
use WP_REST_Request;
use WP_REST_Response;
use WP_User_Query;
use Yay_Wholesale_B2B\Helpers\SettingsHelper;

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
        // GET /roles, POST /roles
        register_rest_route(
            $this->namespace,
            '/roles',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_roles' ],
                    'permission_callback' => [ $this, 'roles_get_permission_callback' ],
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_role' ],
                    'permission_callback' => [ $this, 'roles_permission_callback' ],
                ],
            ]
        );

        // Bulk delete
        register_rest_route(
            $this->namespace,
            '/roles/bulk',
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_roles_bulk' ],
                'permission_callback' => [ $this, 'roles_permission_callback' ],
            ]
        );

        // Bulk status update
        register_rest_route(
            $this->namespace,
            '/roles/bulk-status',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'bulk_update_role_status' ],
                'permission_callback' => [ $this, 'roles_permission_callback' ],
            ]
        );

        // Single role
        register_rest_route(
            $this->namespace,
            '/roles/(?P<roleId>\d+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_role' ],
                    'permission_callback' => [ $this, 'roles_get_permission_callback' ],
                ],
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_role' ],
                    'permission_callback' => [ $this, 'roles_permission_callback' ],
                ],
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_role' ],
                    'permission_callback' => [ $this, 'roles_permission_callback' ],
                ],
            ]
        );
    }

    /**
     * Check if the user has the necessary permissions to access the roles endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function roles_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }

    public function roles_get_permission_callback() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Get the list of roles.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_roles( WP_REST_Request $request ): WP_REST_Response {
        $roles    = get_option( 'yay_wholesale_b2b_roles', [] );
        $settings = SettingsHelper::get_settings();

        $active_filter = $request->get_param( 'active' );

        if ( isset( $active_filter ) ) {
            $roles = array_values( array_filter( $roles, fn( $r ) => $r['status'] === (bool) $active_filter ) );
        }

        foreach ( $roles as $key => &$role ) {
            $slug          = $role['slug'] ?? sanitize_title( $role['name'] );
            $user_query    = new WP_User_Query(
                [
                    'role'   => $slug,
                    'fields' => 'ID',
                    'number' => -1,
                ]
            );
            $count         = $user_query->get_total();
            $role['count'] = $count;
            if ( $count > 0 ) {
                $role['role_url'] = admin_url( 'users.php?role=' . rawurlencode( $slug ) );
            }
            $role['isDefault'] = $slug === $settings['general']['default_role'];

            if ( $role['isDefault'] ) {
                $default_index = $key;
            }
        }

        if ( isset( $default_index ) && $default_index < count( $roles ) - 1 ) {
            $default_role = $roles[ $default_index ];
            unset( $roles[ $default_index ] );
            $roles   = array_values( $roles );
            $roles[] = $default_role;
        }

        return $this->success( $roles );
    }

    /**
     * Get a role by ID.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_role( WP_REST_Request $request ): WP_REST_Response {
        $id    = (int) $request->get_param( 'roleId' );
        $roles = get_option( 'yay_wholesale_b2b_roles', [] );

        $role = array_values( array_filter( $roles, fn( $r ) => (int) ( $r['id'] ?? 0 ) === $id ) )[0] ?? null;

        if ( ! $role ) {
            return $this->error( __( 'Role not found', 'yay-wholesale-b2b' ) );
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

        $roles = get_option( 'yay_wholesale_b2b_roles', [] );
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
        update_option( 'yay_wholesale_b2b_roles', $roles );

        return $this->success( $new_role, __( 'Role created successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Update a role.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_role( WP_REST_Request $request ): WP_REST_Response {
        $params  = $this->get_json_params( $request );
        $role_id = (int) $request->get_param( 'roleId' );

        $roles = get_option( 'yay_wholesale_b2b_roles', [] );
        foreach ( $roles as &$role ) {
            if ( (int) ( $role['id'] ?? 0 ) === $role_id ) {
                $role = array_merge( $role, $params );
                break;
            }
        }
        update_option( 'yay_wholesale_b2b_roles', $roles );

        return $this->success( $params, __( 'Role updated successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Delete a role.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_role( WP_REST_Request $request ): WP_REST_Response {
        $role_id = (int) $request->get_param( 'roleId' );
        $roles   = get_option( 'yay_wholesale_b2b_roles', [] );

        $roles = array_filter(
            $roles,
            function ( $role ) use ( $role_id ) {
                if ( (int) $role['id'] === $role_id ) {
                    RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                    return false;
                }
                return true;
            }
        );

        update_option( 'yay_wholesale_b2b_roles', array_values( $roles ) );

        return $this->success( $roles, __( 'Role deleted successfully', 'yay-wholesale-b2b' ) );
    }

    /**
     * Delete multiple roles.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function delete_roles_bulk( WP_REST_Request $request ): WP_REST_Response {
        $ids   = array_map( 'intval', (array) $request->get_param( 'ids' ) );
        $roles = get_option( 'yay_wholesale_b2b_roles', [] );

        $roles = array_filter(
            $roles,
            function ( $role ) use ( $ids ) {
                if ( in_array( (int) $role['id'], $ids, true ) ) {
                    RolesHelper::remove_wp_role_by_slug( $role['slug'] );
                    return false;
                }
                return true;
            }
        );

        update_option( 'yay_wholesale_b2b_roles', array_values( $roles ) );

        return $this->success( $roles, __( 'Roles deleted successfully', 'yay-wholesale-b2b' ) );
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

        $roles = get_option( 'yay_wholesale_b2b_roles', [] );
        foreach ( $roles as &$role ) {
            if ( in_array( (int) $role['id'], $ids, true ) ) {
                $role['status'] = $status;
            }
        }

        update_option( 'yay_wholesale_b2b_roles', $roles );
        return $this->success( $roles, __( 'Statuses updated successfully', 'yay-wholesale-b2b' ) );
    }
}
