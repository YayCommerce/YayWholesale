<?php

namespace YayWholesaleB2B\Pro\Helpers;

use WC_Shipping_Zones;
use YayWholesaleB2B\Helpers\SettingsHelper;

/**
 * Shipping Helper
 */
class ShippingHelper {

    /**
     * Get the currently shipping methods settings of YayWholesale
     *
     * @return array
     */
    public static function get_shipping_roles_setting() {
        return get_option( 'yaywholesaleb2b_shipping_roles', [] );
    }

    public static function save_shipping_method_settings( array $shipping_method_settings ) {
        update_option( 'yaywholesaleb2b_shipping_roles', $shipping_method_settings );
    }

    /**
     * Get the currently allow-in-checkout payment methods by current user's role
     *
     * @param string $role_slug the current user's role slug.
     * @param int    $zone_id the current user's zone id.
     * @return array
     */
    public static function is_shipping_method_allowed( $shipping_instance_id, $shipping_zone_id, $wholesale_role_slug ) {
        $shipping_settings       = self::get_shipping_roles_setting();
        $shipping_method_setting = array_first(
            array_filter(
                $shipping_settings,
                function ( $shipping ) use ( $shipping_instance_id, $shipping_zone_id ) {
                    return $shipping['zone_id'] === $shipping_zone_id && $shipping['instance_id'] === $shipping_instance_id;
                }
            )
        ) ?? null;

        if ( empty( $shipping_method_setting ) ) {
            return true;
        }

        $is_retailer            = empty( $wholesale_role_slug );
        $shipping_role_settings = $shipping_method_setting['enable_by_role'];
        if ( $is_retailer ) {
            return $shipping_role_settings['retailers'] === 'enabled';
        } elseif ( $shipping_role_settings['wholesalers'] === 'disabled' ) {
            return false;
        } elseif ( $shipping_role_settings['wholesalers'] === 'enabled' ) {
            return true;
        } elseif ( $shipping_role_settings['wholesalers'] === 'enabled-selected-roles' ) {
            return in_array( $wholesale_role_slug, $shipping_role_settings['selected_roles'], true );
        }

        return true;
    }
}
