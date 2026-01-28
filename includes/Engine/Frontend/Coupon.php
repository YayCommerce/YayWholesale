<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
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

        if ( ! is_admin() && RolesHelper::is_wholesale_user() ) {
            return false;
        }

        return $enabled;
    }
}
