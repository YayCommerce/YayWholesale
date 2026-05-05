<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\PaymentGatewayHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Payment Method Engine — Role-based Restrict Payment .
 */
class PaymentGateway {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'woocommerce_available_payment_gateways', [ $this, 'restrict_payment_methods_by_role' ], 999, 1 );
    }

    /**
     * Restrict payment methods by B2B / B2C roles
     *
     * @param array $available_gateways The list of available gateways.
     * @return array The filtered gateways by current role.
     */
    public function restrict_payment_methods_by_role( $available_gateways ) {
        if ( is_admin() ) {
            return $available_gateways;
        }

        $is_wholesale = RolesHelper::is_wholesale_user();

        $all_role_slugs = PaymentGatewayHelper::get_allowed_payment_by_role_slugs(
            $is_wholesale ? $is_wholesale['slug'] : SettingsHelper::B2C_ROLE_SLUG
        );

        $allow_role_slugs   = $all_role_slugs['allowed'];
        $setting_role_slugs = $all_role_slugs['settings'];

        foreach ( $available_gateways as $gateway_id => $gateway ) {
            if ( in_array( $gateway_id, $setting_role_slugs, true ) ) {
                if ( ! in_array( $gateway_id, $allow_role_slugs, true ) ) {
                    unset( $available_gateways[ $gateway_id ] );
                }
            }
        }

        return $available_gateways;
    }
}
