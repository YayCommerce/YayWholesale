<?php
namespace YayWholesaleB2B\Pro\Engine\Payment;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the PO Gateway with the WooCommerce Checkout block. The actual
 * payment processing still runs through POGateway (a plain WC_Payment_Gateway) —
 * WooCommerce's Store API "Legacy" bridge calls its process_payment() for us,
 * this class only makes the gateway selectable in the block UI and hands the
 * frontend script its settings.
 */
class POGatewayBlocksIntegration extends AbstractPaymentMethodType {

    protected $name = POGateway::GATEWAY_ID;

    public function initialize() {
        $this->settings = get_option( 'woocommerce_' . $this->name . '_settings', [] );
    }

    public function is_active() {
        return filter_var( $this->get_setting( 'enabled', false ), FILTER_VALIDATE_BOOLEAN );
    }

    public function get_payment_method_script_handles() {
        $asset_path = YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/dist/blocks/po-gateway-block/index.asset.php';

        if ( ! file_exists( $asset_path ) ) {
            return [];
        }

        $asset        = include $asset_path;
        $dependencies = array_unique(
            array_merge(
                $asset['dependencies'],
                [ 'wc-blocks-registry', 'wc-settings', 'wp-element', 'wp-i18n' ]
            )
        );

        wp_register_script(
            'ywhs-po-gateway-block',
            YAYWHOLESALEB2B_PLUGIN_URL . 'assets/dist/blocks/po-gateway-block/index.js',
            $dependencies,
            $asset['version'],
            true
        );

        if ( function_exists( 'wp_set_script_translations' ) ) {
            wp_set_script_translations( 'ywhs-po-gateway-block', 'yay-wholesale-b2b' );
        }

        return [ 'ywhs-po-gateway-block' ];
    }

    public function get_payment_method_data() {
        return [
            'title'             => $this->get_setting( 'title' ),
            'description'       => $this->get_setting( 'description' ),
            'requireAttachment' => 'yes' === $this->get_setting( 'require_attachment' ),
            'uploadUrl'         => rest_url( 'yay-wholesale/v1/po-gateway/attachment' ),
            'restNonce'         => wp_create_nonce( 'wp_rest' ),
            'supports'          => $this->get_supported_features(),
        ];
    }
}
