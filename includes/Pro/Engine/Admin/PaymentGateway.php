<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Helpers\WoocommerceHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Pro\Helpers\PaymentGatewayHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Payment Method Engine — Role-based Restrict Payment .
 */
class PaymentGateway {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'ywhs_full_settings', [ $this, 'get_payment_settings' ], 10, 1 );
        add_action( 'ywhs_settings_updated', [ $this, 'update_payment_settings' ], 10, 1 );
        add_action( 'ywhs_after_admin_saved_roles', [ $this, 'update_payment_settings_from_role' ], 10, 3 );
        add_action( 'ywhs_after_admin_removed_roles', [ $this, 'remove_role_from_payment_settings' ], 10, 2 );
    }

    public function get_payment_settings( array $settings ) {
        $settings['payment_roles'] = PaymentGatewayHelper::get_payment_roles_setting();
        return $settings;
    }

    public function update_payment_settings( array $settings ) {
        if ( isset( $settings['payment_roles'] ) ) {
            PaymentGatewayHelper::save_payment_method_settings( $settings['payment_roles'] );
        }
    }

    public function update_payment_settings_from_role( string $slug, array $payload, array $roles ) {
        if ( empty( $payload ) || ! array_key_exists( 'paymentMethods', $payload ) ) {
            return;
        }

        $settings           = PaymentGatewayHelper::get_payment_roles_setting();
        $settings_from_role = $payload['paymentMethods'];
        $assign_to_all      = 'enable-all' === $settings_from_role['enabled'];
        $wc_payment_methods = WoocommerceHelper::get_enabled_payment_methods();

        foreach ( $wc_payment_methods as $payment ) {
            $setting = PaymentGatewayHelper::get_default_setting( $payment['method_id'] );
            $index   = -1;

            if ( ! empty( $settings ) ) {
                $tmp = array_search(
                    $payment['method_id'],
                    array_column( $settings, 'method_id' ),
                    true
                );
                if ( isset( $tmp ) && is_numeric( $tmp ) ) {
                    $index   = $tmp;
                    $setting = $settings[ $index ];
                }
            }

            $payment_roles   = $setting['enable_by_role'];
            $already_setting = in_array( $slug, $payment_roles['selected_roles'], true ) || 'enabled' === $payment_roles['wholesalers'];
            $need_to_remove  = ! in_array( $setting['method_id'], $settings_from_role['selected_methods'], true );
            $need_to_add     = in_array( $setting['method_id'], $settings_from_role['selected_methods'], true );

            if ( ( $assign_to_all || $need_to_add ) && ! $already_setting ) {
                // ADD
                $setting['enable_by_role'] = PaymentGatewayHelper::handle_add_data_from_role( $payment_roles, $slug, $roles );
            } elseif ( $already_setting && $need_to_remove ) {
                // REMOVE
                $setting['enable_by_role'] = PaymentGatewayHelper::handle_remove_data_from_role( $payment_roles, $slug, $roles );
            }//end if

            if ( $index < 0 ) {
                $settings[] = $setting;
            } else {
                $settings[ $index ] = $setting;
            }
        }//end foreach

        PaymentGatewayHelper::save_payment_method_settings( $settings );
    }//end update_payment_settings_from_role()

    public function remove_role_from_payment_settings( array $role_slugs, array $roles ) {
        $settings = PaymentGatewayHelper::get_payment_roles_setting();
        foreach ( $role_slugs as $slug ) {
            foreach ( $settings as &$setting ) {
                $payment_roles             = $setting['enable_by_role'];
                $setting['enable_by_role'] = PaymentGatewayHelper::handle_remove_data_from_role( $payment_roles, $slug, $roles );
            }
        }

        PaymentGatewayHelper::save_payment_method_settings( $settings );
    }
}
