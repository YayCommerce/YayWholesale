<?php

namespace YayWholesaleB2B\Helpers;

use Exception;

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
        if ( is_admin() || is_checkout() ) {
            $payment_object = new \WC_Payment_Gateways();
        } else {
            $payment_object = WC()->payment_gateways();
        }

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
        $roles                = get_option( 'yaywholesaleb2b_roles', [] );
        $handled_roles        = array_merge(
            array_map(
                fn( $role ) => [
                    'slug' => $role['slug'],
                    'name' => $role['name'],
                ],
                $roles
            ),
            [
                [
                    'slug' => SettingsHelper::B2C_ROLE_SLUG,
                    'name' => __( 'Retail Customer (B2C)', 'yay-wholesale-b2b' ),
                ],
            ]
        );

        $payment_keys = $all_payment_settings ? array_column( $all_payment_settings, 'method_id' ) : [];

        $payment_settings = [];
        foreach ( $payment_methods as $payment_method ) {
            $setting = [
                'method_id'    => $payment_method['method_id'],
                'title'        => $payment_method['title'],
                'method_title' => $payment_method['method_title'],
                'description'  => $payment_method['description'],
            ];
            if ( ! in_array( $payment_method['method_id'], $payment_keys, true ) ) {
                $setting['roles'] = $handled_roles;
            } else {
                $setting['roles'] = $all_payment_settings[ array_search( $payment_method['method_id'], $payment_keys, true ) ]['roles'];
            }

            $payment_settings[] = $setting;
        }

        return $payment_settings;
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
            if ( empty( $payment['roles'] ) || empty( $payment['method_id'] ) ) {
                continue;
            }

            $payment_role_slugs = array_column( $payment['roles'], 'slug' );

            if ( in_array( $role_slug, $payment_role_slugs, true ) ) {
                $allowed_methods[] = $payment['method_id'];
            }

            $setting_methods[] = $payment['method_id'];
        }

        return [
            'settings' => $setting_methods,
            'allowed'  => $allowed_methods,
        ];
    }
}
