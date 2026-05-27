<?php

namespace YayWholesaleB2B\Pro\Helpers;

use YayWholesaleB2B\Helpers\SettingsHelper;

/**
 * Payment Gateway Helper
 */
class PaymentGatewayHelper {

    /**
     * Get the currently enabled payment methods
     *
     * @return array
     */
    public static function get_enabled_payment_methods() {
        $payment_object = new \WC_Payment_Gateways();

        $methods = [];

        foreach ( $payment_object->payment_gateways() as $gateway ) {
            if ( 'no' === $gateway->enabled ) {
                continue;
            }

            $methods[] = [
                'method_id'    => $gateway->id,
                'title'        => $gateway->title,
                'method_title' => $gateway->method_title,
                'description'  => $gateway->description,
            ];
        }

        return apply_filters( 'ywhs_enabled_payment_methods', $methods );
    }

    /**
     * Get the currently payment methods settings of YayWholesale
     *
     * @return array
     */
    public static function get_payment_roles_setting() {
        $all_payment_settings = get_option( 'yaywholesaleb2b_payment_roles', [] );
        $payment_methods      = self::get_enabled_payment_methods();
        $default_settings     = [
            'retailers'      => 'enabled',
            'wholesalers'    => 'enabled',
            'selected_roles' => [],
        ];

        $payment_keys = $all_payment_settings ? array_column( $all_payment_settings, 'method_id' ) : [];

        $payment_settings = [];
        foreach ( $payment_methods as $payment_method ) {
            $setting = [
                'method_id' => $payment_method['method_id'],
            ];

            if ( ! in_array( $payment_method['method_id'], $payment_keys, true ) ) {
                $setting['enable_by_role'] = $default_settings;
            } else {
                $setting['enable_by_role'] = $all_payment_settings[ array_search( $payment_method['method_id'], $payment_keys, true ) ]['enable_by_role'] ?? $default_settings;
            }

            $payment_settings[] = $setting;
        }

        return $payment_settings;
    }

    public static function save_payment_method_settings( array $payment_method_settings ) {
        update_option( 'yaywholesaleb2b_payment_roles', $payment_method_settings );
    }

    /**
     * Get the currently allow-in-checkout payment methods by current user's role
     *
     * @param string $role_slug the current user's role slug.
     * @return array
     */
    public static function get_allowed_payment_by_role_slugs( $role_slug ) {
        $payment_settings = self::get_payment_roles_setting();

        $allowed_methods = [];
        $setting_methods = [];

        foreach ( $payment_settings as $payment ) {
            if ( empty( $payment['enable_by_role'] ) || empty( $payment['method_id'] ) ) {
                continue;
            }
            if ( empty( $role_slug ) ) {
                $is_retailers_enabled = 'enabled' === $payment['enable_by_role']['retailers'];

                if ( $is_retailers_enabled ) {
                    $allowed_methods[] = $payment['method_id'];
                }
            } else {
                $wholesalers_mode = $payment['enable_by_role']['wholesalers'];
                if ( 'disabled' === $wholesalers_mode ) {
                    $payment_role_slugs = [];
                }

                if ( 'enabled' === $wholesalers_mode ) {
                    $roles              = get_option( 'yaywholesaleb2b_roles', [] );
                    $payment_role_slugs = array_column( $roles, 'slug' );
                } elseif ( 'enabled-selected-roles' === $wholesalers_mode ) {
                    $payment_role_slugs = $payment['enable_by_role']['selected_roles'];
                }

                if ( in_array( $role_slug, $payment_role_slugs, true ) ) {
                    $allowed_methods[] = $payment['method_id'];
                }
            }//end if

            $setting_methods[] = $payment['method_id'];
        }//end foreach

        return [
            'settings' => $setting_methods,
            'allowed'  => $allowed_methods,
        ];
    }
}
