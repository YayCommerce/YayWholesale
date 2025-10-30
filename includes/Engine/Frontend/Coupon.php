<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\SettingsHelper;
defined( 'ABSPATH' ) || exit;
/**
 * Coupon Engine
 */
class Coupon {
    use SingletonTrait;

    protected function __construct() {
        // Enable/disable Coupon
        add_filter( 'woocommerce_coupons_enabled', [ $this, 'coupons_enabled' ], PHP_INT_MAX, 1 );
    }

    /**
     * Enable/disable Coupon
     *
     * @param bool $enabled Whether the coupon is enabled.
     * @return bool Whether the coupon is enabled.
     */
    public function coupons_enabled( $enabled ) {
        // bail if already disabled or guest
        if ( ! $enabled || ! is_user_logged_in() ) {
            return $enabled;
        }

        // check if we have disabled coupons
        $disable_coupons = SettingsHelper::get_settings()['general']['disable_coupon'] ?? false;

        if ( ! $disable_coupons ) {
            return $enabled;
        }

        if ( RolesHelper::is_wholesale_user() ) {
            return false;
        }

        return $enabled;
    }
}
