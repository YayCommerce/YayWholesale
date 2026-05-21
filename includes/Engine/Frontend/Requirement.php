<?php

namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Requirement Progress feature
 */
class Requirement {

    use SingletonTrait;

    protected function __construct() {

        if ( ! CustomerHelper::is_current_wholesale_customer() ) {
            return;
        }

        // Hide checkout + place order buttons
        add_action( 'template_redirect', [ $this, 'remove_proceed_to_checkout_button' ], 999 );
        add_filter( 'woocommerce_order_button_html', [ $this, 'remove_checkout_buttons' ], 999, 1 );
        add_filter( 'render_block_woocommerce/mini-cart-checkout-button-block', [ $this, 'remove_checkout_buttons' ], 999, 1 );
        // add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_checkout_hide_css' ], 999 );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_yay_wholesale_toggle_checkout' ], 999 );
    }

    /**
     * Remove checkout button if the cart does not meet the condition (Legacy shortcode)
     */
    public function remove_proceed_to_checkout_button() {
        if ( ! RequirementHelper::is_cart_meet_requirement( CustomerHelper::get_current_user_wholesale_role() ) ) {
            remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
        } elseif ( ! has_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout' ) ) {
            add_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
        }
    }

    /**
     * Remove checkout buttons if the cart does not meet the condition (Block)
     *
     * @param string $content The content HTML of button.
     * @return string
     */
    public function remove_checkout_buttons( $content ) {
        if ( ! RequirementHelper::is_cart_meet_requirement( CustomerHelper::get_current_user_wholesale_role() ) ) {
            return '';
        }

        return $content;
    }

    /**
     * Enqueue inline CSS to hide checkout buttons when condition is not met
     */
    public function enqueue_checkout_hide_css() {
        // If cart meets requirement → do nothing
        if ( RequirementHelper::is_cart_meet_requirement( CustomerHelper::get_current_user_wholesale_role() ) ) {
            return;
        }

        $checkout_elements = apply_filters( 'ywhs_checkout_query_selector', [] );
        $extra_selectors   = array_filter( (array) $checkout_elements );

        $selectors = array_merge(
            $extra_selectors,
            [
                '.wp-block-woocommerce-proceed-to-checkout-block',
                'a.checkout',
                '.wc-block-components-checkout-place-order-button',
            ]
        );

        $selector_string = implode( ",\n", array_map( 'sanitize_text_field', $selectors ) );

        $css = "
        {$selector_string} {
            visibility: hidden;
        }
    ";

        // Enqueue empty stylesheet and add inline CSS
        wp_register_style( 'ywhs-hide-checkout', false, [], YAYWHOLESALEB2B_VERSION );
        wp_enqueue_style( 'ywhs-hide-checkout' );
        wp_add_inline_style( 'ywhs-hide-checkout', $css );
    }

    /**
     * Enqueue the toggle-checkout-buttons script by the cart and requirement
     */
    public function enqueue_yay_wholesale_toggle_checkout() {
        $wholesale = CustomerHelper::get_current_user_wholesale_role();
        $slug      = 'ywhs_wholesale_checkout';

        // Enqueue the toggle-behavior script
        wp_enqueue_script(
            $slug,
            YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/wholesale-toggle-checkout.js',
            [ 'wp-data' ],
            YAYWHOLESALEB2B_VERSION,
            true
        );

        // Get the original price map to check if it meet the requirments
        $price_map = [];
        $cart      = WC()->cart->get_cart();

        foreach ( $cart as $cart_item_key => $cart_item ) {
            $product                     = wc_get_product( $cart_item['data']->get_id() );
            $price_map[ $cart_item_key ] = wc_get_price_excluding_tax( $product );
        }

        $wholesale['minOrderQuantity'] = RequirementHelper::get_min_order_quantity( $wholesale );
        $wholesale['minOrderAmount']   = RequirementHelper::get_min_order_amount( $wholesale );

        // Localize script
        wp_localize_script(
            $slug,
            'ywhsToggleCheckout',
            [
                'wholesale'        => $wholesale,
                'priceMap'         => $price_map,
                'checkoutElements' => apply_filters( 'ywhs_checkout_query_selector', [] ),
            ]
        );
    }
}
