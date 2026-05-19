<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\ReportsHelper;

/**
 * Order Pricing Helper
 */
class OrderPricingHelper {
    /**
     * Calculate the price after applying the wholesale discount
     *
     * @param float       $order The current handling order.
     * @param float       $extra The extra price in order.
     * @param \WC_Product $product The product object.
     * @param array       $role The wholesale role.
     * @param int         $quantity The quantity of product in order.
     * @return float The discounted price.
     */
    public static function calculate_wholesale_price_from_order( $order, $extra, $product, $role, $quantity = 1 ) {
        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $sale          = (float) $product->get_price( 'edit' );
        $regular       = (float) $product->get_regular_price( 'edit' );

        // Get the price to discount
        $price = ( $apply_to_sale && $sale < $regular ) ? $sale : $regular;

        $price = apply_filters( 'ywhs_convert_price_from_order', $price, $order, $product );

        $discount_data = ProductPricingHelper::get_product_wholesale_discount_data( $product, $role, $quantity );

        if ( 'rate' === $discount_data['wholesale_discount_type'] ) {
            $discount = isset( $discount_data['wholesale_discount_value'] ) ? ( (float) $discount_data['wholesale_discount_value'] / 100 ) : 0;
            if ( $discount <= 0 ) {
                return $price;
            }

            $final_price = max( 0, ( $price ) * ( 1 - $discount ) );
        } else {
            $final_price = (float) $discount_data['wholesale_discount_value'];
            $final_price = apply_filters( 'ywhs_convert_price_from_order', $final_price, $order, null );
        }

        // Calculate wholesale extra price
        $discounted_extra = ShopPricingHelper::calculate_wholesale_discount_for_extra( $extra, $role );

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

        // Handle the extra price map for each item
        if ( empty( $order->get_meta( '_ywhs_extra_price_map', true ) ) ) {
            $extra_price_map = [];
            foreach ( $order->get_items() as $item ) {
                if ( ! $item instanceof \WC_Order_Item_Product ) {
                    continue;
                }

                $quantity         = $item->get_quantity();
                $product          = $item->get_product();
                $is_including_tax = wc_prices_include_tax();

                // Calculate the Extra price of current order items that is added or substracted
                // Generally: Unit price = Origin_price (advance pricing, role-based) + Extra_price (role-based)
                // Unit Price * quantity = total
                if ( $is_including_tax ) {
                    $unit_price = ( $item->get_subtotal() + $item->get_subtotal_tax() ) / $quantity;
                } else {
                    $unit_price = ( $item->get_subtotal() ) / $quantity;
                }
                $initial_price = $unit_price;

                $initial_price = round( $initial_price, wc_get_price_decimals() );

                $discount_data = ProductPricingHelper::get_product_wholesale_discount_data( $product, $wholesale_role, $quantity );
                $origin_price  = $product->get_price();

                // Discount the origin by wholesale rule
                if ( $is_discounted ) {
                    if ( 'rate' === $discount_data['wholesale_discount_type'] ) {
                        $origin_price = max( 0, $origin_price * ( 1 - ( $discount_data['wholesale_discount_value'] / 100 ) ) );
                    } else {
                        // Product can be wholesale fixed price
                        $custom_price = $discount_data['wholesale_discount_value'];
                        $origin_price = apply_filters( 'ywhs_price_handle_processed', $custom_price, null, null );
                    }
                }

                $origin_price = round( $origin_price, wc_get_price_decimals() );

                $extra_price = $initial_price - $origin_price;
                // Convert discounted extra price to original extra price (extra only applied to role-based rule)
                if ( $is_discounted ) {
                    $extra_price = $extra_price / ( 1 - ( $wholesale_role['discount'] / 100 ) );
                    $extra_price = round( $extra_price, wc_get_price_decimals() );
                }

                $extra_price_map[ $item->get_id() ] = $extra_price;

            }//end foreach

            $order->update_meta_data( '_ywhs_extra_price_map', $extra_price_map );
        }//end if
    }
}
