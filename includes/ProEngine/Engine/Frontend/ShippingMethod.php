<?php
namespace YayWholesaleB2B\ProEngine\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\ProEngine\Helpers\ShippingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Shipping Method Engine — Role-based Restrict Payment .
 */
class ShippingMethod {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'woocommerce_package_rates', [ $this, 'restrict_shipping_methods_by_role_checkout' ], 999, 2 );

        add_filter( 'ywhs_full_settings', [ $this, 'get_shipping_settings' ], 10, 1 );
        add_action( 'ywhs_settings_updated', [ $this, 'update_shipping_settings' ], 10, 1 );
    }

    /**
     * Restrict shipping methods by B2B / B2C roles
     *
     * @param array $rates The list of available shipping rates.
     * @param array $package the infomation of address, zone,.v.v.
     * @return array The filtered rates by current role.
     */
    public function restrict_shipping_methods_by_role_checkout( $rates, $package ) {
        if ( is_admin() ) {
            return $rates;
        }

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        $zone    = wc_get_shipping_zone( $package );
        $zone_id = $zone->get_id();

        $shipping_role_slugs = ShippingHelper::get_shipping_by_role_slug(
            isset( $wholesale_role ) ? $wholesale_role['slug'] : SettingsHelper::B2C_ROLE_SLUG,
            $zone_id
        );

        $allow_role_slugs   = $shipping_role_slugs['allowed'];
        $setting_role_slugs = $shipping_role_slugs['setting'];

        foreach ( $rates as $rate_id => $rate ) {
            // format: method:instance_id:___other_info
            $instance_id = (int) explode( ':', $rate->id )[1];

            // Check if the shipping is in setting and the shipping is allowed or not (Won't delete the dynamid shippings)
            if ( isset( $setting_role_slugs[ $rate->method_id ] ) && in_array( $instance_id, $setting_role_slugs[ $rate->method_id ], true ) ) {
                if ( ! isset( $allow_role_slugs[ $rate->method_id ] ) || ! in_array( $instance_id, $allow_role_slugs[ $rate->method_id ], true ) ) {
                    unset( $rates[ $rate_id ] );
                }
            }
        }
        return $rates;
    }

    public function get_shipping_settings( array $settings ) {
        $settings['shipping_roles'] = ShippingHelper::get_shipping_roles_setting();
        return $settings;
    }

    public function update_shipping_settings( array $settings ) {
        if ( isset( $settings['shipping_roles'] ) ) {
            ShippingHelper::save_shipping_method_settings( $settings['shipping_roles'] );
        }
    }
}
