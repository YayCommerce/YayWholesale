<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Pro\Helpers\PaymentGatewayHelper;

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

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        foreach ( $available_gateways as $gateway_id => $gateway ) {
            $is_payment_method_allowed = PaymentGatewayHelper::is_payment_method_allowed(
                $gateway_id,
                isset( $wholesale_role ) ? $wholesale_role['slug'] : null
            );

            if ( ! $is_payment_method_allowed ) {
                unset( $available_gateways[ $gateway_id ] );
            }
        }

        return $available_gateways;
    }
}
