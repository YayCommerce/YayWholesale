<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
defined( 'ABSPATH' ) || exit;
/**
 * Coupon Engine
 */
class Coupon {
    use SingletonTrait;

    protected function __construct() {
        // Enable/disable Coupon
        add_filter( 'woocommerce_coupons_enabled', [ $this, 'ywhs_coupons_enabled' ], PHP_INT_MAX, 1 );

        add_action( 'woocommerce_before_calculate_totals', [ $this, 'maybe_remove_coupon_items' ] );
    }

    /**
     * Enable/disable Coupon
     *
     * @param bool $enabled Whether the coupon is enabled.
     * @return bool Whether the coupon is enabled.
     */
    public function ywhs_coupons_enabled( $enabled ) {
        // bail if already disabled or guest
        if ( ! $enabled || ! is_user_logged_in() ) {
            return $enabled;
        }

        // check if we have disabled coupons
        $disable_coupons = SettingsHelper::get_settings()['general']['disable_coupon'] ?? false;

        if ( ! $disable_coupons ) {
            return $enabled;
        }

        if ( ! is_admin() && CustomerHelper::is_current_wholesale_customer() ) {
            return false;
        }

        return $enabled;
    }

    /**
     * Removed already existed coupons if disabled coupon currently for wholesalers
     *
     * @param \WC_Cart $cart The cart object.
     */
    public function maybe_remove_coupon_items( $cart ) {
        $disable_coupons = SettingsHelper::get_settings()['general']['disable_coupon'] ?? false;
        if ( CustomerHelper::is_current_wholesale_customer() && $disable_coupons && ! empty( WC()->cart->get_applied_coupons() ) ) {
            $coupons = WC()->cart->get_applied_coupons();

            foreach ( $coupons as $coupon_code ) {
                WC()->cart->remove_coupon( $coupon_code );
            }
        }
    }
}
