<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Users Page
 */
class Users {
    use SingletonTrait;

    protected function __construct() {
        // Filter editable roles
        add_filter( 'editable_roles', [ $this, 'editable_roles' ], 10, 1 );

        add_action( 'show_user_profile', [ $this, 'add_custom_user_fields' ], 99 );
        add_action( 'edit_user_profile', [ $this, 'add_custom_user_fields' ], 99 );
    }

    public function editable_roles( $roles ) {

        if ( ! is_admin() ) {
            return $roles;
        }

        $wholesaler = '';
        // Verify nonce before processing form data from $_GET to prevent CSRF attacks.
        if ( isset( $_GET['_wpnonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'yay-wholesale-create-user' ) ) {
            if ( isset( $_GET['wholesaler'] ) && ! empty( $_GET['wholesaler'] ) ) {
                $wholesaler = sanitize_text_field( wp_unslash( $_GET['wholesaler'] ) );
            }
        }

        if ( 'yay_wholesale_b2b' !== $wholesaler ) {
            return $roles;
        }

        $wholesale_roles = get_option( 'yaywholesaleb2b_roles', [] );
        $wholesale_roles = array_column( $wholesale_roles, 'slug' );

        // Filter $roles keeping only keys also present in $wholesale_roles
        $wholesale_roles = array_intersect_key( $roles, array_flip( $wholesale_roles ) );

        // If no wholesale roles are found, return the original roles
        return $wholesale_roles ? $wholesale_roles : $roles;
    }

    public function add_custom_user_fields( \WP_User $user ) {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/user/edit-user.php';
    }
}
