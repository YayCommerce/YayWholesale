<?php

namespace YayWholesaleB2B\Pro\Helpers;

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
     * Check the currently allow-in-checkout shipping methods by current user's role
     *
     * @param int         $shipping_instance_id the shipping's instance id.
     * @param int         $shipping_zone_id the shipping's zone id.
     * @param string|null $wholesale_role_slug the current user's wholesale role slug (null if retailer | guest).
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


    public static function get_default_setting( int $instance_id, int $zone_id ) {
        return [
            'instance_id'    => $instance_id,
            'zone_id'        => $zone_id,
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
                $enable_by_role_setting['wholesalers']    = 'enabled-selected-roles';
                $enable_by_role_setting['selected_roles'] = array_column(
                    array_filter(
                        $roles,
                        fn( $role ) => $role['slug'] !== $slug
                    ),
                    'slug'
                );
                break;
            case 'enabled-selected-roles':
                $enable_by_role_setting['selected_roles'] = array_values(
                    array_diff( $enable_by_role_setting['selected_roles'], [ $slug ] )
                );

                if ( count( $enable_by_role_setting['selected_roles'] ) < 1 ) {
                    $enable_by_role_setting['wholesalers'] = 'disabled';
                }

                break;
            case 'disabled':
            default:
                break;
        }//end switch

        return $enable_by_role_setting;
    }
}
