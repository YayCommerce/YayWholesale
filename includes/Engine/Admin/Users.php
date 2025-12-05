<?php
namespace Yay_Wholesale\Engine\Admin;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Users Page
 */
class Users {
    use SingletonTrait;

    protected function __construct() {
        // Filter editable roles
        add_filter( 'editable_roles', [ $this, 'editable_roles' ], 10, 1 );
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

        if ( 'yay_wholesale' !== $wholesaler ) {
            return $roles;
        }

        $wholesale_roles = get_option( 'yay_wholesale_roles', [] );
        $wholesale_roles = array_column( $wholesale_roles, 'slug' );

        // Filter $roles keeping only keys also present in $wholesale_roles
        $wholesale_roles = array_intersect_key( $roles, array_flip( $wholesale_roles ) );

        // If no wholesale roles are found, return the original roles
        return $wholesale_roles ? $wholesale_roles : $roles;
    }
}
