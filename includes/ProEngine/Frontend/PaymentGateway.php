<?php
namespace YayWholesaleB2B\ProEngine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\ProEngine\Helpers\PaymentGatewayHelper;

defined( 'ABSPATH' ) || exit;

// TODO: move file to YayWholesaleB2B\Pro\Engine\Frontend

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

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        $all_role_slugs = PaymentGatewayHelper::get_allowed_payment_by_role_slugs(
            isset( $wholesale_role ) ? $wholesale_role['slug'] : SettingsHelper::B2C_ROLE_SLUG
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
