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

        // Add editable wholesaler registration fields to the user profile form.
        add_action( 'show_user_profile', [ $this, 'add_custom_user_fields' ], 99 );
        add_action( 'edit_user_profile', [ $this, 'add_custom_user_fields' ], 99 );

        // Save editable wholesaler registration fields from the user profile form.
        add_action( 'personal_options_update', [ $this, 'save_custom_user_fields' ], 20 );
        add_action( 'edit_user_profile_update', [ $this, 'save_custom_user_fields' ], 20 );
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
        wp_nonce_field( 'yay-wholesale-edit-user-fields', 'yay_wholesale_user_fields_nonce' );
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/user/edit-user.php';
    }

    /**
     * Save editable wholesaler registration fields from the user profile form.
     *
     * @param int $user_id User ID being updated.
     */
    public function save_custom_user_fields( int $user_id ): void {
        if ( ! current_user_can( 'edit_user', $user_id ) ) {
            return;
        }

        if ( ! isset( $_POST['yay_wholesale_user_fields_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['yay_wholesale_user_fields_nonce'] ) ), 'yay-wholesale-edit-user-fields' ) ) {
            return;
        }

        $approved_request_id = get_user_meta( $user_id, RequestsHelper::USER_META_REQUEST, true );
        if ( empty( $approved_request_id ) ) {
            $approved_request_id = RequestsHelper::get_the_last_approved_request_id_of_user( $user_id );
        }

        if ( empty( $approved_request_id ) ) {
            return;
        }

        $request_data = get_post_meta( $approved_request_id, RequestsHelper::REQUEST_META_DATA, true );
        if ( ! is_array( $request_data ) ) {
            return;
        }

        $editable_types = [ 'text', 'email', 'phone', 'number', 'date', 'textarea' ];
        $updated        = false;

        foreach ( $request_data as $label => &$field ) {
            if ( ! is_array( $field ) || empty( $field['key'] ) || empty( $field['type'] ) ) {
                continue;
            }

            if ( ! in_array( $field['type'], $editable_types, true ) ) {
                continue;
            }

            $field_key = $field['key'];
            if ( ! isset( $_POST[ $field_key ] ) ) {
                continue;
            }

            $field['value'] = $this->sanitize_request_field_value( $field['type'], sanitize_text_field( wp_unslash( $_POST[ $field_key ] ) ) );
            $updated        = true;
        }
        unset( $field );

        if ( $updated ) {
            update_post_meta( $approved_request_id, RequestsHelper::REQUEST_META_DATA, $request_data );
            // Apply billing field mappings on approval.
            RequestsHelper::apply_billing_field_mappings_on_approval( $user_id, $request_data );
        }
    }

    /**
     * Sanitize a registration field value by type.
     *
     * @param string $type  Field type.
     * @param mixed  $value Raw submitted value.
     * @return string
     */
    private function sanitize_request_field_value( string $type, $value ): string {
        if ( ! is_scalar( $value ) ) {
            return '';
        }

        switch ( $type ) {
            case 'email':
                return sanitize_email( (string) $value );
            case 'textarea':
                return sanitize_textarea_field( (string) $value );
            case 'number':
                return is_numeric( $value ) ? (string) $value : sanitize_text_field( (string) $value );
            case 'date':
                $sanitized = sanitize_text_field( (string) $value );
                if ( ! empty( $sanitized ) && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $sanitized ) ) {
                    return '';
                }
                return $sanitized;
            default:
                return sanitize_text_field( (string) $value );
        }
    }
}
