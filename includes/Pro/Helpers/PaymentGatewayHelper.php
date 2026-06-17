<?php

namespace YayWholesaleB2B\Pro\Helpers;

/**
 * Payment Gateway Helper
 */
class PaymentGatewayHelper {

    /**
     * Get the currently payment methods settings of YayWholesale
     *
     * @return array
     */
    public static function get_payment_roles_setting() {
        return get_option( 'yaywholesaleb2b_payment_roles', [] );
    }

    public static function save_payment_method_settings( array $payment_method_settings ) {
        update_option( 'yaywholesaleb2b_payment_roles', $payment_method_settings );
    }

    /**
     * Check the currently allow-in-checkout payment methods by current user's role
     *
     * @param string      $payment_method_id The payment method id.
     * @param string|null $wholesale_role_slug the current user's role slug.
     * @return bool
     */
    public static function is_payment_method_allowed( $payment_method_id, $wholesale_role_slug ) {
        $payment_settings       = self::get_payment_roles_setting();
        $payment_method_setting = array_first(
            array_filter(
                $payment_settings,
                function( $payment ) use ( $payment_method_id ) {
                    return $payment['method_id'] === $payment_method_id;
                }
            )
        ) ?? null;

        if ( empty( $payment_method_setting ) ) {
            return true;
        }

        $is_retailer           = $wholesale_role_slug === null;
        $payment_role_settings = $payment_method_setting['enable_by_role'];
        if ( $is_retailer ) {
            return $payment_role_settings['retailers'] === 'enabled';
        } elseif ( $payment_role_settings['wholesalers'] === 'disabled' ) {
            return false;
        } elseif ( $payment_role_settings['wholesalers'] === 'enabled' ) {
            return true;
        } elseif ( $payment_role_settings['wholesalers'] === 'enabled-selected-roles' ) {
            return in_array( $wholesale_role_slug, $payment_role_settings['selected_roles'], true );
        }

        return true;
    }

    public static function get_default_setting( string $method_id ) {
        return [
            'method_id'      => $method_id,
            'enable_by_role' => [
                'retailers'      => 'enabled',
                'wholesalers'    => 'enabled',
                'selected_roles' => [],
            ],
        ];
    }

    /**
     * Handle the data to add to the setting from the Role's payload
     *
     * @param array  $enable_by_role_setting The setting[enable_by_role].
     * @param string $slug The role slug.
     * @param array  $roles The roles list.
     * @return array
     */
    public static function handle_add_data_from_role( $enable_by_role_setting, $slug, $roles ) {
        // Add role
        $enable_by_role_setting['selected_roles'] = array_merge( $enable_by_role_setting['selected_roles'], [ $slug ] );

        // Update other settings
        if ( 'disabled' === $enable_by_role_setting['wholesalers'] ) {
            $enable_by_role_setting['wholesalers'] = 'enabled-selected-roles';
        } elseif ( count( $enable_by_role_setting['selected_roles'] ) === count( $roles ) ) {
            $enable_by_role_setting['wholesalers']    = 'enabled';
            $enable_by_role_setting['selected_roles'] = [];
        }
        return $enable_by_role_setting;
    }

    /**
     * Handle the data to remove from the setting by the Role's payload
     *
     * @param array  $enable_by_role_setting The setting[enable_by_role].
     * @param string $slug The role slug.
     * @param array  $roles The roles list.
     * @return array
     */
    public static function handle_remove_data_from_role( $enable_by_role_setting, $slug, $roles ) {
        // Remove
        switch ( $enable_by_role_setting['wholesalers'] ) {
            case 'enabled':
                $filtered_roles = array_column(
                    array_filter(
                        $roles,
                        fn( $role ) => $role['slug'] !== $slug
                    ),
                    'slug'
                );

                if ( count( $filtered_roles ) === count( $roles ) ) {
                    $enable_by_role_setting['wholesalers']    = 'enabled';
                    $enable_by_role_setting['selected_roles'] = [];
                } else {
                    $enable_by_role_setting['wholesalers']    = 'enabled-selected-roles';
                    $enable_by_role_setting['selected_roles'] = $filtered_roles;
                }

                break;
            case 'enabled-selected-roles':
                $enable_by_role_setting['selected_roles'] = array_values(
                    array_diff( $enable_by_role_setting['selected_roles'], [ $slug ] )
                );

                if ( count( $enable_by_role_setting['selected_roles'] ) < 1 ) {
                    $enable_by_role_setting['wholesalers'] = 'disabled';
                }

                if ( count( $enable_by_role_setting['selected_roles'] ) === count( $roles ) ) {
                    $enable_by_role_setting['wholesalers']    = 'enabled';
                    $enable_by_role_setting['selected_roles'] = [];
                }

                break;
            case 'disabled':
            default:
                break;
        }//end switch

        return $enable_by_role_setting;
    }
}
