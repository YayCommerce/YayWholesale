<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\PricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Tax Engine — Disable tax for wholesale users when setting enabled.
 */
class Tax {
    use SingletonTrait;

    private $disable_tax;

    private $tax_display_mode;

    protected function __construct() {
        $setting                = SettingsHelper::get_settings();
        $this->disable_tax      = $setting['general']['disable_tax'] ?? false;
        $this->tax_display_mode = $setting['general']['tax_display_mode'] ?? 'inherit';

        add_action( 'wp', [ $this, 'ywhs_set_customer_vat_exempt' ], PHP_INT_MAX );
        add_filter( 'pre_option_woocommerce_tax_display_shop', [ $this, 'ywhs_force_display_excl_tax' ], PHP_INT_MAX );
        // add_filter( 'woocommerce_calc_tax', [ $this, 'ywhs_maybe_disable_tax_calc' ], 9999 );
        add_filter( 'woocommerce_calc_shipping_tax', [ $this, 'ywhs_maybe_disable_tax_calc' ], 999 );
    }

    /**
     * Set customer VAT exempt status for wholesale users.
     */
    public function ywhs_set_customer_vat_exempt() {
        if ( ! is_user_logged_in() || is_admin() || ! function_exists( 'WC' ) || ! isset( WC()->customer ) ) {
            return;
        }

        $is_wholesale = RolesHelper::is_wholesale_user();

        // If not wholesale user, always set exempt to false.
        if ( ! $is_wholesale ) {
            WC()->customer->set_is_vat_exempt( false );
            return;
        }

        // If wholesale user + setting disable_tax = true => exempt tax.
        if ( $this->disable_tax && PricingHelper::meets_discount_conditions( $is_wholesale ) ) {
            WC()->customer->set_is_vat_exempt( true );
        } else {
            WC()->customer->set_is_vat_exempt( false );
        }
    }

    /**
     * Force shop price display mode to "Excluding tax" for wholesale users
     * when disable_tax = true.
     *
     * @param string $pre_option
     * @return string
     */
    public function ywhs_force_display_excl_tax( $pre_option ) {
        if ( ! is_user_logged_in() || is_admin() ) {
            return $pre_option;
        }

        $is_wholesale = RolesHelper::is_wholesale_user();

        if ( $is_wholesale && $this->disable_tax && PricingHelper::meets_discount_conditions( $is_wholesale ) ) {
            return 'excl';
        }

        if ( $is_wholesale && 'inherit' !== $this->tax_display_mode ) {
            return $this->tax_display_mode;
        }

        return $pre_option;
    }

    /**
     * Disable tax calculation entirely for wholesale users
     * when disable_tax = true.
     *
     * @param array $taxes The taxes array.
     * @return array The taxes array.
     */
    public function ywhs_maybe_disable_tax_calc( $taxes ) {
        if ( ! is_user_logged_in() ) {
            return $taxes;
        }

        $is_wholesale = RolesHelper::is_wholesale_user();

        if ( $is_wholesale && $this->disable_tax && PricingHelper::meets_discount_conditions( $is_wholesale ) ) {
            return [];
        }

        return $taxes;
    }
}
