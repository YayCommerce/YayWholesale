<?php

namespace YayWholesaleB2B\Helpers\PricingHelpers;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\ReportsHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

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
    public static function handle_order_type_meta( $order, $wholesale_role, $is_discounted ) {
        if ( $is_discounted ) {
            $order->update_meta_data( '_ywhs_wholesale_role', $wholesale_role['name'] );
        } else {
            $order->delete_meta_data( '_ywhs_wholesale_role' );
        }
        $order->save_meta_data();
        
        ReportsHelper::delete_ywhs_report_transient();
    }

    /**
     * Handle order item extra price map
     *
     * @param \WC_Order $order The order object.
     * @param array     $wholesale_role the wholesale role.
     * @param bool      $is_discounted the discounted flag.
     */
    public static function handle_order_item_extra_price_map( $order, $wholesale_role, $is_discounted ) {
        // Handle the extra price map for each item
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
                    $origin_price = apply_filters( 'ywhs_after_calc_price_additional_processed', $custom_price, null, null );
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
    }

    /**
     * Set the order data discounted when the admin recalculates orders or new order has just created
     *
     * @param \WC_Order $order The order object.
     */
    public static function update_and_recalculate_order( &$order ) {
        $customer_id = filter_input( INPUT_POST, 'ywhs_customer', FILTER_SANITIZE_NUMBER_INT );
        if ( empty( $customer_id ) ) {
            $customer_id = $order->get_customer_id();
            if ( empty( $customer_id ) ) {
                return;
            }
        }

        $customer       = get_user_by( 'ID', $customer_id );
        $wholesale_role = CustomerHelper::get_wholesale_role( $customer );

        if ( ! isset( $wholesale_role ) ) {
            return;
        }
        $wholesale_role['minOrderAmount']   = apply_filters( 'ywhs_convert_price_from_order', $wholesale_role['minOrderAmount'], $order, null );
        $wholesale_role['minOrderQuantity'] = RequirementHelper::get_min_order_quantity( $wholesale_role );

        $setting            = SettingsHelper::get_settings();
        $is_disabled_coupon = $setting['general']['disable_coupon'] ?? false;
        $items              = [];

        $is_discounted = RequirementHelper::is_order_meet_requirement( $order, $wholesale_role );

        self::calculate_price_of_items(
            $order,
            $is_discounted,
            $is_disabled_coupon,
            $wholesale_role,
        );

        self::handle_order_type_meta( $order, $wholesale_role, $is_discounted );
    }//end update_and_recalculate_order()


    /**
     * Calculate the final price and tax of order items
     *
     * @param \WC_Order $order the order object.
     * @param bool      $is_discounted the status of order that meet the discount requirement.
     * @param bool      $is_disabled_coupon the disabled coupon setting.
     * @param array     $wholesale_role wholesale role of owner.
     */
    protected static function calculate_price_of_items(
        \WC_Order $order,
        bool $is_discounted,
        bool $is_disabled_coupon,
        array $wholesale_role
    ) {
        $extra_price_map = $order->get_meta( '_ywhs_extra_price_map' );
        $items           = [];

        if ( ! is_array( $extra_price_map ) ) {
            $extra_price_map = [];
        }

        // Handeling price and tax
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }

            $quantity = $item->get_quantity();
            $product  = $item->get_product();
            $extra    = $extra_price_map[ $item->get_id() ] ?? 0;

            if ( $is_discounted ) {
                $price = self::calculate_wholesale_price_from_order( $order, $extra, $product, $wholesale_role, $quantity );
            } else {
                $price = apply_filters( 'ywhs_convert_price_from_order', $product->get_price( 'edit' ), $order, $product );
                $price = $price + $extra;
            }

            $new_price = wc_get_price_excluding_tax( $product, [ 'price' => $price ] );

            $item->set_subtotal( $new_price * $quantity );
            $item->set_total( $new_price * $quantity );

            $items[] = $item->get_name() . ' x ' . $quantity;
        }//end foreach

        // Update the shipping meta data
        foreach ( $order->get_items( 'shipping' ) as $shipping ) {
            $shipping->update_meta_data( 'Items', implode( ', ', $items ) );
        }

        // Recalculate the tax
        $order->calculate_taxes();

        // Re-apply coupon
        $coupons = $order->get_items( 'coupon' );
        $order->remove_order_items( 'coupon' );
        if ( ! $is_discounted || ! $is_disabled_coupon ) {
            foreach ( $coupons as $coupon_item ) {
                /** @var \WC_Order_Item_Coupon $coupon_item */

                $code = $coupon_item->get_code();
                $order->apply_coupon( $code );

            }
        }
    }//end calculate_price_of_items()
}
