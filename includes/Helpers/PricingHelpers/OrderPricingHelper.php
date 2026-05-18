<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\ReportsHelper;
use YayWholesaleB2B\Utils\Utils;

/**
 * Order Pricing Helper
 */
class OrderPricingHelper {
    /**
     * Calculate the price after applying the wholesale discount
     *
     * @param float       $price The price.
     * @param float       $extra The extra price in order.
     * @param \WC_Product $product The product object.
     * @param array       $role The wholesale role.
     * @param int         $quantity The quantity of product in order.
     * @return float The discounted price.
     */
    public static function calculate_wholesale_price( $price, $extra, $product, array $role, $quantity = 1 ) {

        $discounted_extra = ShopPricingHelper::calculate_wholesale_discount_for_extra( $extra, $role );

        $discounted_extra = apply_filters( 'ywhs_extra_calculated_before_add_to_price', $discounted_extra );
        $final_price      = 0;

        if ( Utils::is_pro() ) {
            // Pro handle for product based, category based, price tier
            $handled_price = $handled_price = \YayWholesaleB2B\ProEngine\Helpers\PricingHelpers\AdvancedPricingHelper::get_final_advanced_price( $price, $product, $role, $quantity );
            if ( ! empty( $handled_price ) ) {
                $final_price = $handled_price;
            }
        }

        // Lite handle (Role based percentage discount)
        if ( (float) $final_price === 0.0 ) {
            $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
            if ( $discount < 0 ) {
                return $price;
            }
            $final_price = max( 0, ( $price ) * ( 1 - $discount ) );
        }

        $final_price = $final_price + $discounted_extra;

        return (float) wc_format_decimal( $final_price, wc_get_price_decimals() );
    }

    /**
     * Handle wholesale / retail order after created
     *
     * @param \WC_Order $order The order object.
     * @param array     $wholesale_role the wholesale role.
     * @param bool      $is_discounted the discounted flag.
     */
    public static function handle_order( $order, $wholesale_role, $is_discounted ) {
        if ( $is_discounted ) {
            $order->update_meta_data( '_ywhs_wholesale_role', $wholesale_role['name'] );
        } else {
            $order->delete_meta_data( '_ywhs_wholesale_role' );
        }

        ReportsHelper::delete_ywhs_report_transient();

        if ( ! is_admin() ) {
            $extra_price_map = [];
            foreach ( $order->get_items() as $item ) {
                if ( ! $item instanceof \WC_Order_Item_Product ) {
                    continue;
                }

                $quantity         = $item->get_quantity();
                $product          = $item->get_product();
                $is_including_tax = wc_prices_include_tax();

                // Calculate the Extra price of current order items that is added or substracted
                // Unit Price * quantity = total
                if ( $is_including_tax ) {
                    $unit_price = ( $item->get_subtotal() + $item->get_subtotal_tax() ) / $quantity;
                } else {
                    $unit_price = ( $item->get_subtotal() ) / $quantity;
                }
                $initial_price = $unit_price;
                if ( $is_discounted ) {
                    // (initial price) * (1 - discount) = Unit Price
                    $initial_price = $unit_price / ( 1 - ( $wholesale_role['discount'] / 100 ) );
                }
                $initial_price = round( $initial_price, wc_get_price_decimals() );

                $origin_price = $product->get_price();

                $origin_price = round( $origin_price, wc_get_price_decimals() );

                $extra_price_map[ $item->get_id() ] = $initial_price - $origin_price;

            }//end foreach

            $order->update_meta_data( '_ywhs_extra_price_map', $extra_price_map );
        }//end if
    }
}
