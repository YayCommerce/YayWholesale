<?php
namespace Yay_Wholesale\Engine;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * RestAPI Class
 */
class RestAPI {
    use SingletonTrait;

    protected function __construct() {

        add_action( 'rest_api_init', [ $this, 'yay_wholesale_endpoints' ] );
    }

    public function yay_wholesale_endpoints() {

        // POST /settings
        register_rest_route(
            'yay-wholesale/v1',
            '/settings',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'wholesale_manage_settings' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        register_rest_route(
            'yay-wholesale/v1',
            '/mark-reviewed',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'mark_reviewed' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // GET /roles
        register_rest_route(
            'yay-wholesale/v1',
            '/roles',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_roles' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // GET /roles/{id}
        register_rest_route(
            'yay-wholesale/v1',
            '/roles/(?P<roleId>[a-zA-Z0-9_-]+)',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_role' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // POST /roles
        register_rest_route(
            'yay-wholesale/v1',
            '/roles',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'create_role' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // PUT /roles
        register_rest_route(
            'yay-wholesale/v1',
            '/roles/(?P<roleId>[a-zA-Z0-9_-]+)',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'update_role' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // DELETE /roles
        register_rest_route(
            'yay-wholesale/v1',
            '/roles/(?P<roleId>[a-zA-Z0-9_-]+)',
            [
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_role' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        // DELETE /roles/bulk
        register_rest_route(
            'yay-wholesale/v1',
            '/roles/bulk',
            [
                [
                    'methods'             => 'DELETE',
                    'callback'            => [ $this, 'delete_roles_bulk' ],
                    'permission_callback' => '__return_true',
                ],
            ]
        );

        do_action( 'yaywholesale_restapi_endpoints' );
    }

    public function wholesale_manage_settings( $request ) {
        $params = $request->get_params();
        if ( ! empty( $params ) && is_array( $params ) ) {
            // save settings
            update_option( 'yay_wholesale_settings', $params );
        }

        // Return the updated settings
        return rest_ensure_response(
            [
                'success' => true,
                'message' => __( 'Settings saved!', 'yay-wholesale' ),
            ]
        );
    }

    public function mark_reviewed() {
        update_option( 'yay_wholesale_reviewed', true );

        return rest_ensure_response( true );
    }

    public function get_roles() {
        return rest_ensure_response( get_option( 'yay_wholesale_roles', [] ) );
    }

    public function get_role( $request ) {
        $role_id = $request->get_param( 'roleId' );
        if ( ! $role_id ) {
            return rest_ensure_response( [ 'message' => __( 'Role ID is required', 'yay-wholesale' ) ], 400 );
        }

        $roles = get_option( 'yay_wholesale_roles', [] );
        $role  = wp_list_filter( $roles, [ 'id' => $role_id ] );

        if ( empty( $role ) ) {
            return rest_ensure_response( [ 'message' => __( 'Role not found', 'yay-wholesale' ) ], 404 );
        }

        return rest_ensure_response( array_shift( $role ), 200 );
    }

    public function create_role( $request ) {
        $params = $request->get_params();
        if ( empty( $params ) || ! is_array( $params ) ) {
            return rest_ensure_response(
                [
                    'success' => false,
                    'message' => __( 'Invalid role data', 'yay-wholesale' ),
                ],
                400
            );
        }

        $role_name = sanitize_text_field( $params['name'] );
        $role_id   = sanitize_text_field( $params['id'] );
        // Add role if it doesn't exist
        if ( ! get_role( $role_id ) ) {
            add_role(
                $role_id,
                $role_name,
                [
                    'read' => true,
                ]
            );
        }

        // Save role to option yay_wholesale_roles
        $roles   = get_option( 'yay_wholesale_roles', [] );
        $roles[] = $params;

        update_option( 'yay_wholesale_roles', $roles );

        return rest_ensure_response(
            [
                'success' => true,
                'message' => __( 'Role created successfully', 'yay-wholesale' ),
                'data'    => $params,
            ]
        );
    }

    public function update_role( $request ) {
        $params = $request->get_params();
        if ( empty( $params ) || ! is_array( $params ) || ! isset( $params['roleId'] ) ) {
            return rest_ensure_response(
                [
                    'success' => false,
                    'message' => __( 'Invalid role data', 'yay-wholesale' ),
                ],
                400
            );
        }

        $role_id = sanitize_text_field( $params['roleId'] );
        if ( ! get_role( $role_id ) ) {
            return rest_ensure_response( [ 'message' => __( 'Role not found', 'yay-wholesale' ) ], 404 );
        }
        unset( $params['roleId'] );
        $roles = get_option( 'yay_wholesale_roles', [] );
        foreach ( $roles as $key => $role ) {
            if ( $role['id'] === $role_id ) {
                $roles[ $key ] = $params;
                break;
            }
        }

        update_option( 'yay_wholesale_roles', $roles );

        return rest_ensure_response(
            [
                'success' => true,
                'message' => __( 'Role updated successfully', 'yay-wholesale' ),
                'data'    => $params,
            ]
        );
    }

    public function delete_role( $request ) {
        $role_id = $request->get_param( 'roleId' );
        if ( ! $role_id ) {
            return rest_ensure_response( [ 'message' => __( 'Role ID is required', 'yay-wholesale' ) ], 400 );
        }
        $roles = get_option( 'yay_wholesale_roles', [] );
        foreach ( $roles as $key => $role ) {
            if ( $role['id'] === $role_id ) {
                if ( get_role( $role['id'] ) ) {
                    wp_roles()->remove_role( $role['id'] );
                }
                unset( $roles[ $key ] );
                break;
            }
        }

        update_option( 'yay_wholesale_roles', $roles );

        return rest_ensure_response(
            [
                'success' => true,
                'message' => __( 'Role deleted successfully', 'yay-wholesale' ),
            ]
        );
    }

    public function delete_roles_bulk( $request ) {
        $params = $request->get_params();
        if ( ! empty( $params ) && is_array( $params ) ) {
            delete_option( 'yay_wholesale_roles' );
        }
    }
}
