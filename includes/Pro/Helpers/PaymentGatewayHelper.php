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

        if ( empty( $payment_method_setting ) || empty( $payment_method_setting['enable_by_role'] ) ) {
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
}
