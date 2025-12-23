<?php
namespace Yay_Wholesale\Controllers;

use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\WholeSalersHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Requests API endpoints.
 */
class WholeSalersController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    /**
     * Check if the user has the necessary permissions to access the whole salers list endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function wholesalers_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
        }

        return true;
    }

    /**
     * Initialize the hooks.
     *
     * @return void
     */
    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/wholesalers',
            [

                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_wholesalers' ],
                    'permission_callback' => [ $this,'wholesalers_permission_callback' ],
                ],
            ]
        );
        register_rest_route(
            $this->namespace,
            '/wholesalers/(?P<user_id>\d+)',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_wholesaler_role' ],
                'permission_callback' => [ $this,'wholesalers_permission_callback' ],
            ]
        );

        register_rest_route(
            $this->namespace,
            '/wholesalers/bulk-role',
            [
                [
                    'methods'             => 'PUT',
                    'callback'            => [ $this, 'bulk_update_wholesaler_role' ],
                    'permission_callback' => [ $this,'wholesalers_permission_callback' ],
                ],
            ]
        );
    }

    /**
     * Get the list of wholesalers.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function get_wholesalers( WP_REST_Request $request ): WP_REST_Response {
        $page     = $request['page'];
        $per_page = $request['per_page'];
        $search   = $request['search'];
        $role     = $request['role'];

        if ( ! isset( $page ) ) {
            $page = 1;
        }

        if ( ! isset( $per_page ) ) {
            $per_page = 10;
        }

        if ( ! isset( $search ) ) {
            $search = '';
        }

        if ( ! isset( $role ) ) {
            $role = '';
        }

        $response = WholeSalersHelper::get_wholesalers_list( $search, $page, $per_page, $role );

        return $this->success( $response, __( 'Whole salers list fetched successfully', 'yay-wholesale' ) );
    }

    /**
     * Update the role of a wholesaler.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function update_wholesaler_role( WP_REST_Request $request ): WP_REST_Response {
        $user_id   = (int) $request->get_param( 'user_id' );
        $role_slug = $request->get_param( 'role_slug' );

        if ( ! $role_slug || empty( $role_slug ) || ! get_role( $role_slug ) ) {
            return $this->error( __( 'Missing role slug', 'yay-wholesale' ) );
        }

        $user = get_user_by( 'ID', $user_id );
        if ( ! $user ) {
            return $this->error( __( 'User not exists', 'yay-wholesale' ), 404 );
        }

        RolesHelper::remove_ywhs_role_from_user( $user );

        $user->add_role( $role_slug );

        return $this->success( [], __( 'Wholesaler role updated successfully', 'yay-wholesale' ) );
    }

    /**
     * Bulk update the role of multiple wholesalers.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function bulk_update_wholesaler_role( WP_REST_Request $request ): WP_REST_Response {
        $user_ids  = array_map( 'intval', (array) $request->get_param( 'ids' ) );
        $role_slug = $request->get_param( 'role_slug' );

        if ( empty( $user_ids ) || ! is_array( $user_ids ) ) {
            return $this->error( __( 'Missing user ids', 'yay-wholesale' ) );
        }

        if ( empty( $role_slug ) ) {
            return $this->error( __( 'Missing role slug', 'yay-wholesale' ) );
        }
        if ( empty( $role_slug ) || ! get_role( $role_slug ) ) {
            return $this->error( __( 'Role slug is invalid', 'yay-wholesale' ) );
        }

        $users = get_users( [ 'include' => $user_ids ] );
        foreach ( $users as $user ) {
            if ( ! $user ) {
                continue;
            }
            RolesHelper::remove_ywhs_role_from_user( $user );

            $user->add_role( $role_slug );
        }

        return $this->success( [], __( 'Wholesalers role updated successfully', 'yay-wholesale' ) );
    }
}
