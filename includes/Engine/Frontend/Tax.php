<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\SettingsHelper;
use Yay_Wholesale\Helpers\PricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Tax Engine — Disable tax for wholesale users when setting enabled.
 */
class Tax {
    use SingletonTrait;

    private $disable_tax;

    protected function __construct() {
        $this->disable_tax = SettingsHelper::get_settings()['general']['disable_tax'] ?? false;

        add_action( 'wp', [ $this, 'set_customer_vat_exempt' ], PHP_INT_MAX );
        add_filter( 'pre_option_woocommerce_tax_display_shop', [ $this, 'force_display_excl_tax' ], PHP_INT_MAX );
        add_filter( 'woocommerce_calc_tax', [ $this, 'maybe_disable_tax_calc' ], 9999 );
    }

    /**
     * Set customer VAT exempt status for wholesale users.
     */
    public function set_customer_vat_exempt() {
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
    public function force_display_excl_tax( $pre_option ) {
        if ( ! is_user_logged_in() ) {
            return $pre_option;
        }

        $is_wholesale = RolesHelper::is_wholesale_user();

        if ( $is_wholesale && $this->disable_tax && PricingHelper::meets_discount_conditions( $is_wholesale ) ) {
            return 'excl';
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
    public function maybe_disable_tax_calc( $taxes ) {
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
