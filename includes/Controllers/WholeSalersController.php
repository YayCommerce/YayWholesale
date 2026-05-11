<?php
namespace YayWholesaleB2B\Controllers;

use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\WholeSalersHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesalers endpoints.
 */
class WholeSalersController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/wholesalers',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_wholesalers' ],
                'permission_callback' => [ $this, 'can_manage_wholesalers' ],
            ],
        );
        register_rest_route(
            self::REST_NAMESPACE,
            '/wholesalers/(?P<user_id>\d+)/update-role',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_wholesaler_role' ],
                'permission_callback' => [ $this,'can_manage_wholesalers_and_roles' ],
            ]
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/wholesalers/bulk-update-role',
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'bulk_update_wholesaler_role' ],
                'permission_callback' => [ $this,'can_manage_wholesalers_and_roles' ],
            ],
        );
    }

    public function get_wholesalers( WP_REST_Request $request ) {
        $page      = intval( $request->get_param( 'page' ) || 1 );
        $per_page  = intval( $request->get_param( 'per_page' ) || 10 );
        $search    = sanitize_text_field( $request->get_param( 'search' ) || '' );
        $role_slug = sanitize_text_field( $request->get_param( 'role_slug' ) || '' );

        $response = WholeSalersHelper::get_paginated_wholesalers_list( $search, $page, $per_page, $role_slug );
        return $response;
    }

    public function update_wholesaler_role( WP_REST_Request $request ) {
        $user_id   = (int) $request->get_param( 'user_id' );
        $payload   = $request->get_json_params();
        $role_slug = $payload['roleSlug'];

        if ( empty( $role_slug ) ) {
            return $this->error_invalid_arguments();
        }

        $wholesale_roles = RolesHelper::get_active_wholesale_roles();
        $role_config     = RolesHelper::get_role_by_slug( $wholesale_roles, $role_slug );
        if ( empty( $role_config ) ) {
            return $this->error_invalid_arguments();
        }

        $user = get_user_by( 'ID', $user_id );
        if ( $user === false ) {
            return $this->error_not_found();
        }

        RolesHelper::remove_ywhs_role_from_user( $user );
        $user->add_role( $role_slug );

        return true;
    }

    public function bulk_update_wholesaler_role( WP_REST_Request $request ) {
        $payload   = $request->get_json_params();
        $user_ids  = $payload['userIds'];
        $role_slug = $payload['roleSlug'];

        if ( empty( $user_ids ) || ! is_array( $user_ids ) ) {
            return $this->error_invalid_arguments();
        }
        if ( empty( $role_slug ) ) {
            return $this->error_invalid_arguments();
        }

        $wholesale_roles = RolesHelper::get_active_wholesale_roles();
        $role_config     = RolesHelper::get_role_by_slug( $wholesale_roles, $role_slug );
        if ( empty( $role_config ) ) {
            return $this->error_invalid_arguments();
        }

        $users         = get_users( [ 'include' => $user_ids ] );
        $updated_count = 0;
        foreach ( $users as $user ) {
            if ( ! $user ) {
                continue;
            }

            RolesHelper::remove_ywhs_role_from_user( $user );
            $user->add_role( $role_slug );
            ++$updated_count;
        }

        return $updated_count;
    }

    public function can_manage_wholesalers() {
        if ( current_user_can( 'edit_posts' ) && current_user_can( 'manage_woocommerce' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }

    public function can_manage_wholesalers_and_roles() {
        if ( current_user_can( 'edit_posts' ) && current_user_can( 'manage_woocommerce' ) && current_user_can( 'promote_users' ) ) {
            return true;
        }

        return $this->error_forbidden();
    }
}
