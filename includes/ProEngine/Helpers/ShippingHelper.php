<?php

namespace YayWholesaleB2B\ProEngine\Helpers;

use WC_Shipping_Zones;
use YayWholesaleB2B\Helpers\SettingsHelper;

/**
 * Shipping Helper
 */
class ShippingHelper {

    /**
     * Get the currently enabled shipping methods
     *
     * @return array
     */
    public static function get_enabled_shipping_methods() {
        if ( did_action( 'woocommerce_init' ) === 0 ) {
            return [];
        }

        $zones_data = [];

        $zones = WC_Shipping_Zones::get_zones();

        $zones[0] = WC_Shipping_Zones::get_zone( 0 )->get_data();

        foreach ( $zones as $zone_id => $zone ) {

            $zone_obj = WC_Shipping_Zones::get_zone( $zone_id );
            $methods  = $zone_obj->get_shipping_methods( true );

            foreach ( $methods as $method ) {
                $zones_data[] = [
                    'instance_id'   => $method->instance_id,
                    'method_id'     => $method->id,
                    'instance_name' => $method->get_title(),
                    'method_name'   => $method->get_method_title(),
                    'description'   => $method->get_option( 'description' ),
                    'zone_id'       => $zone_id,
                    'zone_name'     => $zone_obj->get_zone_name(),
                ];
            }
        }

        return apply_filters( 'ywhs_enabled_shipping_methods', $zones_data );
    }

    /**
     * Get the currently shipping methods settings of YayWholesale
     *
     * @return array
     */
    public static function get_shipping_roles_setting() {
        $all_shipping_settings = get_option( 'yaywholesaleb2b_shipping_roles', [] );
        $shipping_methods      = self::get_enabled_shipping_methods();
        $roles                 = get_option( 'yaywholesaleb2b_roles', [] );
        $handled_roles         = array_merge(
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

        $shipping_keys = $all_shipping_settings ? array_column( $all_shipping_settings, 'instance_id' ) : [];

        $shipping_settings = [];
        foreach ( $shipping_methods as $shipping_method ) {
            $shipping = [
                'instance_id'   => $shipping_method['instance_id'],
                'method_id'     => $shipping_method['method_id'],
                'instance_name' => $shipping_method['instance_name'],
                'method_name'   => $shipping_method['method_name'],
                'description'   => $shipping_method['description'],
                'zone_id'       => $shipping_method['zone_id'],
                'zone_name'     => $shipping_method['zone_name'],
            ];

            if ( ! in_array( $shipping_method['instance_id'], $shipping_keys, true ) ) {
                $shipping['roles'] = $handled_roles;
            } else {
                $shipping['roles'] = $all_shipping_settings[ array_search( $shipping_method['instance_id'], $shipping_keys, true ) ]['roles'];
            }

            $shipping_settings[] = $shipping;
        }

        return $shipping_settings;
    }

    /**
     * Get the currently allow-in-checkout payment methods by current user's role
     *
     * @param string $role_slug the current user's role slug.
     * @param int    $zone_id the current user's zone id.
     * @return array
     */
    public static function get_shipping_by_role_slug( $role_slug, $zone_id ) {
        $shipping_settings = self::get_shipping_roles_setting();

        $allowed_shippings = [];
        $setting_shippings = [];

        foreach ( $shipping_settings as $shipping ) {
            if ( empty( $shipping['roles'] ) || empty( $shipping['method_id'] ) ) {
                continue;
            }

            if ( $shipping['zone_id'] !== $zone_id ) {
                continue;
            }

            $shipping_role_slugs = array_column( $shipping['roles'], 'slug' );

            if ( in_array( $role_slug, $shipping_role_slugs, true ) ) {
                if ( ! isset( $allowed_shippings[ $shipping['method_id'] ] ) ) {
                    $allowed_shippings[ $shipping['method_id'] ] = [];
                }

                $allowed_shippings[ $shipping['method_id'] ][] = $shipping['instance_id'];
            }

            if ( ! isset( $setting_shippings[ $shipping['method_id'] ] ) ) {
                $setting_shippings[ $shipping['method_id'] ] = [];
            }

            $setting_shippings[ $shipping['method_id'] ][] = $shipping['instance_id'];

        }//end foreach

        return [
            'setting' => $setting_shippings,
            'allowed' => $allowed_shippings,
        ];
    }
}
