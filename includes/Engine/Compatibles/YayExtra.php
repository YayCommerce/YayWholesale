<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Helpers\PricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayCurrency Compatible
 */
class YayExtra {
    use SingletonTrait;

    protected function __construct() {
        if ( ! defined( 'YAYE_VERSION' ) ) {
            return;
        }

        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
        // add_action( 'woocommerce_before_add_to_cart_button', [ $this, 'add_total_wholesale_field' ], 11, 0 );
    }

    public function enqueue_scripts() {
        if ( ! is_product() ) {
            return;
        }
        $dep           = [ 'jquery', 'wp-i18n', 'wp-hooks' ];
        $script_handle = 'yay-extra-compatible';

        $wholesale_role = PricingHelper::get_effective_role();
        $product        = wc_get_product( get_the_ID() );

        if ( isset( $wholesale_role ) ) {
            $is_discounted = PricingHelper::meets_discount_conditions( $wholesale_role );
        } else {
            $is_discounted = false;
        }

        $currency = apply_filters( 'ywhs_get_currency_by_third_party', [] );

        wp_enqueue_script( $script_handle, YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/yay-extra-compatible.js', $dep, YAYWHOLESALEB2B_VERSION, false );
        wp_localize_script(
            $script_handle,
            'yayWholesaleExtra',
            [
                'rest_url'       => esc_url_raw( rest_url() ),
                'rest_nonce'     => wp_create_nonce( 'wp_rest' ),
                'rest_base'      => 'yay-wholesale/v1',
                'wholesale_role' => $wholesale_role,
                'is_discounted'  => $is_discounted,
                'price'          => apply_filters( 'ywhs_price_handle_processed', $product->get_price( 'edit' ) ),
                'regular_price'  => apply_filters( 'ywhs_price_handle_processed', $product->get_regular_price( 'edit' ) ),
                'currency_rate'  => empty( $currency ) ? 1 : $currency['rate'],
            ]
        );
    }
}
