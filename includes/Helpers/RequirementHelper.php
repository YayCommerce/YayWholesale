<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\YayWholesaleB2B;

/**
 * Requirements Helper Class
 */
class RequirementHelper {

    /**
     * Handle the min order amount of wholesale role
     *
     * @param array $wholesale_role The wholesale role.
     * @return float
     */
    public static function get_min_order_amount( array $wholesale_role ) {
        // Handle price (Compatible to other price-related plugins)
        return floatval( isset( $wholesale_role['minOrderAmount'] ) ? apply_filters( 'ywhs_after_calc_price_additional_processed', $wholesale_role['minOrderAmount'], null, null ) : 0 );
    }

    /**
     * Handle the min order quantity of wholesale role
     *
     * @param array $wholesale_role The wholesale role.
     * @return float
     */
    public static function get_min_order_quantity( array $wholesale_role ) {
        if ( ! isset( $wholesale_role['minOrderQuantity'] ) || ! YayWholesaleB2B::is_pro() ) {
            return 0;
        }

        return intval( $wholesale_role['minOrderQuantity'] );
    }

    /**
     * Check if current cart meet the wholesale requirement
     *
     * @param array $role The wholesale role.
     * @return bool
     */
    public static function is_cart_meet_requirement( $role ) {
        if ( ! did_action( 'wp_loaded' ) ) {
            return false;
        }

        if ( ( ! class_exists( 'WC_Cart' ) || ! WC()->cart ) ) {
            return false;
        }

        if ( ! isset( $role ) ) {
            return false;
        }

        $qty   = WC()->cart->get_cart_contents_count();
        $total = self::calc_actual_subtotal_of_cart();

        $min_qty    = self::get_min_order_quantity( $role );
        $min_amount = self::get_min_order_amount( $role );

        if ( ( $min_qty > 0 && $qty < $min_qty ) || ( $min_amount > 0 && $total < $min_amount ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check if current order meet the wholesale requirement
     *
     * @param \WC_Order $order The order.
     * @param array     $role The wholesale role.
     * @return bool
     */
    public static function is_order_meet_requirement( $order, $role ) {
        if ( ! did_action( 'wp_loaded' ) ) {
            return false;
        }

        if ( ! isset( $role ) ) {
            return false;
        }

        $quantity = $order->get_item_count();
        $subtotal = self::calc_actual_subtotal_of_order( $order );

        $min_qty    = $role['minOrderQuantity'];
        $min_amount = $role['minOrderAmount'];

        if ( ( $min_qty > 0 && $quantity < $min_qty ) || ( $min_amount > 0 && $subtotal < $min_amount ) ) {
            return false;
        }

        return true;
    }

    /**
     * Calculate the current actual subtotal in current user's cart
     *
     * @return float The actual subtotal of cart
     */
    public static function calc_actual_subtotal_of_cart() {
        $cart     = WC()->cart->get_cart();
        $subtotal = 0;

        // Calculate the subtotal (in this action, subtotal is not calculated)
        foreach ( $cart as $cart_item ) {
            $product = wc_get_product( $cart_item['data']->get_id() );
            $extra   = apply_filters( 'ywhs_cart_item_extra_price_before_apply_discount', 0, $cart_item );

            $extra     = apply_filters( 'ywhs_after_calc_price_additional_processed', $extra, null, null );
            $price     = wc_get_price_excluding_tax( $product ) + $extra;
            $subtotal += $price * $cart_item['quantity'];

        }

        return $subtotal;
    }

    /**
     * Calculate the current actual subtotal in current order
     *
     * @param \WC_Order $order The order.
     * @return float The actual subtotal of cart
     */
    public static function calc_actual_subtotal_of_order( $order ) {
        $subtotal        = 0;
        $extra_price_map = $order->get_meta( '_ywhs_extra_price_map' );
        // Calculate the subtotal with original unit price
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }
            $extra     = $extra_price_map[ $item->get_id() ] ?? 0;
            $product   = $item->get_product();
            $price     = apply_filters( 'ywhs_convert_price_from_order', $product->get_price(), $order, $product );
            $price    += $extra;
            $subtotal += $price * $item->get_quantity();
        }
        return $subtotal;
    }
}
