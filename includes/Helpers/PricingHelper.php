<?php

namespace Yay_Wholesale\Helpers;

use Yay_Wholesale\Engine\Frontend\Pricing;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\SettingsHelper;

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
            $roles = get_option( 'yay_wholesale_roles', [] );
            $role  = RolesHelper::get_role_by_slug( $roles, SettingsHelper::get_settings()['general']['default_role'] );
            if ( ! $role || empty( $role['status'] ) ) {
                return null;
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
     * @return float The discounted price.
     */
    public static function calc_discounted_price( $price, array $role, \WC_Product $product ) {
        $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $price;
        }

        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $regular       = (float) $product->get_regular_price( 'edit' );
        $sale          = (float) $product->get_sale_price( 'edit' );

        $base = ( $apply_to_sale && $sale > 0 ) ? $sale : $regular;
        $new  = max( 0, $base * ( 1 - $discount ) );

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

        remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
        // Calculate the subtotal (in this action, subtotal is not calculated)
        foreach ( $cart as $cart_item ) {
            $product   = wc_get_product( $cart_item['product_id'] );
            $subtotal += $product->get_price() * $cart_item['quantity'];
        }

        add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

        return $subtotal;
    }
}
