<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Pro\Helpers\ShippingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Shipping Method Engine — Role-based Restrict Payment .
 */
class ShippingMethod {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'ywhs_full_settings', [ $this, 'get_shipping_settings' ], 10, 1 );
        add_action( 'ywhs_settings_updated', [ $this, 'update_shipping_settings' ], 10, 1 );
        add_action( 'ywhs_after_admin_saved_roles', [ $this, 'update_shipping_settings_from_role' ], 10, 3 );
    }

    public function get_shipping_settings( array $settings ) {
        $settings['shipping_roles'] = ShippingHelper::get_shipping_roles_setting();
        return $settings;
    }

    public function update_shipping_settings( array $settings ) {
        if ( isset( $settings['shipping_roles'] ) ) {
            ShippingHelper::save_shipping_method_settings( $settings['shipping_roles'] );
        }
    }

    public function update_shipping_settings_from_role( string $slug, array $payload, array $roles ) {
        if ( empty( $payload ) || ! array_key_exists( 'shippingMethods', $payload ) ) {
            return;
        }

        $settings           = ShippingHelper::get_shipping_roles_setting();
        $settings_from_role = $payload['shippingMethods'];
        $assign_to_all      = 'enable-all' === $settings_from_role['enabled'];

        foreach ( $settings as &$setting ) {
            $shipping_roles  = $setting['enable_by_role'];
            $already_setting = in_array( $slug, $shipping_roles['selected_roles'], true ) || 'enabled' === $shipping_roles['wholesalers'];
            $need_to_remove  = ! in_array( $setting['instance_id'], $settings_from_role['selected_methods'], true );
            $need_to_add     = in_array( $setting['instance_id'], $settings_from_role['selected_methods'], true );

            // ADD
            if ( ( $assign_to_all || $need_to_add ) && ! $already_setting ) {
                // Add role
                $shipping_roles['selected_roles'] = array_merge( $shipping_roles['selected_roles'], [ $slug ] );

                // Update other settings
                if ( 'disabled' === $shipping_roles['wholesalers'] ) {
                    $shipping_roles['wholesalers'] = 'enabled-selected-roles';
                } elseif ( count( $shipping_roles['selected_roles'] ) === count( $roles ) ) {
                    $shipping_roles['wholesalers']    = 'enabled';
                    $shipping_roles['selected_roles'] = [];
                }
                $setting['enable_by_role'] = $shipping_roles;
                continue;
            }

            // Remove
            if ( $already_setting && $need_to_remove ) {
                switch ( $shipping_roles['wholesalers'] ) {
                    case 'enabled':
                        $shipping_roles['wholesalers']    = 'enabled-selected-roles';
                        $shipping_roles['selected_roles'] = array_column(
                            array_filter(
                                $roles,
                                fn( $role ) => $role['slug'] !== $slug
                            ),
                            'slug'
                        );
                        break;
                    case 'enabled-selected-roles':
                        $shipping_roles['selected_roles'] = array_values(
                            array_diff( $shipping_roles['selected_roles'], [ $slug ] )
                        );

                        if ( count( $shipping_roles['selected_roles'] ) < 1 ) {
                            $shipping_roles['wholesalers'] = 'disabled';
                        }

                        break;
                    case 'disabled':
                    default:
                        break;
                }//end switch
                $setting['enable_by_role'] = $shipping_roles;
            }//end if
        }//end foreach

        ShippingHelper::save_shipping_method_settings( $settings );
    }//end update_shipping_settings_from_role()
}
