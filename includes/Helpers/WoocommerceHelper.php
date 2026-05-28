<?php

namespace YayWholesaleB2B\Helpers;

/**
 * Get Woocommerce configurations
 */
class WoocommerceHelper {

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

        return $methods;
    }

    // TODO review: thêm method tương tự cho shipping
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

        $zones = \WC_Shipping_Zones::get_zones();

        $zones[0] = \WC_Shipping_Zones::get_zone( 0 )->get_data();

        foreach ( $zones as $zone_id => $zone ) {

            $zone_obj = \WC_Shipping_Zones::get_zone( $zone_id );
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

        return $zones_data;
    }
}
