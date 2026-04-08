<?php

namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Utils\Utils;

/**
 * Common Helper
 */
class PricingHelper {

    /**
     * Get the effective role
     *
     * @param bool $allow_default Allow default role.
     * @return array|null The effective role or null if not found.
     */
    public static function get_effective_role( bool $allow_default = false ): ?array {
        $role = RolesHelper::is_wholesale_user();

        if ( ! $role && $allow_default && ! empty( SettingsHelper::get_settings()['general']['default_role'] ) ) {
            $roles = get_option( 'yaywholesaleb2b_roles', [] );
            $role  = RolesHelper::get_role_by_slug( $roles, SettingsHelper::get_settings()['general']['default_role'] );
            if ( ! $role || empty( $role['status'] ) ) {
                return null;
            }
            // Handle price (Compatible to other price-related plugins)
            $role['minOrderAmount'] = apply_filters( 'ywhs_price_handle_processed', $role['minOrderAmount'] );

            if ( ! Utils::is_pro() ) {
                $role['minOrderQuantity'] = 0;
            }
        }
        return $role;
    }

    /**
     * Check if the cart conditions are met
     *
     * @param array $role The role array.
     * @param int   $quantity The actual quantity (if not included, a quantity of cart items will be used).
     * @param float $subtotal The actual subtotal (if not included, a subtotal of WC cart will be used).
     * @return bool True if the cart conditions are met, false otherwise.
     */
    public static function meets_discount_conditions( array $role, int $quantity = -1, float $subtotal = -1 ): bool {
        if ( ! class_exists( 'WC_Cart' ) || ! WC()->cart ) {
            return true;
        }

        $qty   = $quantity >= 0 ? $quantity : WC()->cart->get_cart_contents_count();
        $total = $subtotal >= 0 ? $subtotal : self::calc_actual_subtotal_of_cart();

        $min_qty    = $role['minOrderQuantity'] ?? 0;
        $min_amount = $role['minOrderAmount'] ?? 0;

        if ( ( $min_qty > 0 && $qty < $min_qty ) || ( $min_amount > 0 && $total < $min_amount ) ) {
            return false;
        }

        return true;
    }

    /**
     * Apply the wholesale discount
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @param bool        $is_preview Is preview.
     * @return float The discounted price.
     */
    public static function apply_wholesale_discount( $price, \WC_Product $product, bool $is_preview = false ) {
        $show_to_all = SettingsHelper::get_settings()['general']['show_wholesale_price'] ?? false;

        $role = self::get_effective_role( false );
        if ( ! $role && $is_preview && $show_to_all ) {
            $role = self::get_effective_role( true );
        }

        if ( ! $role ) {
            return $price;
        }

        $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $price;
        }

        $is_actual_wholesale = (bool) self::get_effective_role( false );
        if ( $is_actual_wholesale && ! self::meets_discount_conditions( $role ) ) {
            return $price;
        }

        return self::calc_discounted_price( $price, $role, $product );
    }

    /**
     * Calculate the price after applying the wholesale discount
     *
     * @param float       $price The price.
     * @param array       $role The wholesale role.
     * @param \WC_Product $product The product object.
     * @param float       $extra The extra price in order.
     * @return float The discounted price.
     */
    public static function calc_discounted_price( $price, array $role, \WC_Product $product, $extra = 0 ) {
        $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $price;
        }

        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $regular       = (float) $product->get_regular_price();
        $sale          = (float) $product->get_sale_price( 'edit' );

        if ( $sale > 0 ) {
            $sale = floatval( $price );
        } else {
            $regular = floatval( $price );
        }

        $base = ( $apply_to_sale && $sale > 0 ) ? $sale : $regular;

        $new = max( 0, ( $base + $extra ) * ( 1 - $discount ) );

        return wc_format_decimal( $new, wc_get_price_decimals() );
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
        HooksHelper::remove_price_hooks();
        foreach ( $cart as $cart_item ) {
            $product   = $cart_item['data'];
            $price     = $product->get_price();
            $subtotal += $price * $cart_item['quantity'];
        }
        HooksHelper::add_price_hooks();

        return $subtotal;
    }

    /**
     * Check if the order meets the condition of wholesale role
     *
     * @param \WC_Order $order The order object.
     * @param array     $wholesale_role the wholesale role.
     * @return bool
     */
    public static function check_is_discounted( \WC_Order $order, array $wholesale_role ) {
        $quantity = $order->get_item_count();
        $subtotal = 0;

        // Calculate the subtotal with original unit price
        HooksHelper::remove_price_hooks();
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }
            $product = $item->get_product();
            $price   = $product->get_price();
            if ( is_ajax() ) {
                $price = apply_filters( 'ywhs_product_price_ajax_handled', $price, $product, 'price' );
            }
            $subtotal += $price * $item->get_quantity();
        }
        HooksHelper::add_price_hooks();

        $is_discounted = isset( $wholesale_role ) && self::meets_discount_conditions( $wholesale_role, $quantity, $subtotal );

        return $is_discounted;
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

            // Send email when new wholesale order has just been placed
            $email_trigger = (int) $order->get_meta( '_ywhs_wholesale_email_trigger' );

            if ( ( ! isset( $email_trigger ) || $email_trigger < 1 ) ) {
                do_action( 'ywhs_new_wholesale_order_placed', $order->get_id(), $order );
                $order->update_meta_data( '_ywhs_wholesale_email_trigger', ++$email_trigger );
            }
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

                $quantity = $item->get_quantity();
                $product  = $item->get_product();

                // Calculate the Extra price of current order items that is added or substracted
                // Unit Price * quantity = subtotal
                $unit_price    = $item->get_subtotal() / $quantity;
                $initial_price = $unit_price;
                if ( $is_discounted ) {
                    // (initial price) * (1 - discount) = Unit Price
                    $initial_price = $unit_price / ( 1 - ( $wholesale_role['discount'] / 100 ) );
                }
                $initial_price = round( $initial_price, wc_get_price_decimals() );

                HooksHelper::remove_price_hooks();

                $is_including_tax = wc_prices_include_tax();
                $origin_price     = $product->get_price();
                if ( $is_including_tax ) {
                    $origin_price = wc_get_price_excluding_tax( $product );
                }

                $extra_price_map[ $item->get_id() ] = $initial_price - $origin_price;

                HooksHelper::add_price_hooks();
            }//end foreach

            $order->update_meta_data( '_ywhs_extra_price_map', $extra_price_map );
        }//end if
    }
}
