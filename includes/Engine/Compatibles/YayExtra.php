<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use WC_Tax;
use YayWholesaleB2B\Helpers\CustomerHelper;
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
    }

    public function enqueue_scripts() {
        if ( ! is_product() ) {
            return;
        }
        $dep           = [ 'jquery', 'wp-i18n', 'wp-hooks' ];
        $script_handle = 'yay-extra-compatible';

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        $product_id     = get_the_ID();
        $product        = wc_get_product( $product_id );
        if ( ! isset( $product ) ) {
            return;
        }

        // Price
        $sale_prices    = [];
        $regular_prices = [];

        $children = $product->get_children();
        if ( count( $children ) ) {
            foreach ( $children as $child ) {
                $child_product            = wc_get_product( $child );
                $sale_prices[ $child ]    = (float) $child_product->get_sale_price();
                $regular_prices[ $child ] = (float) $child_product->get_regular_price();
            }
        } else {
            $sale_prices[ $product_id ]    = (float) $product->get_sale_price();
            $regular_prices[ $product_id ] = (float) $product->get_regular_price();
        }

        // Currency
        $currency = apply_filters( 'ywhs_get_currency_by_third_party', [] );

        // Tax
        $tax_class = $product->get_tax_class();
        $tax_rates = WC_Tax::get_rates( $tax_class );

        if ( ! empty( $tax_rates ) ) {
            $first_rate = reset( $tax_rates );
            $tax_rate   = $first_rate['rate'];
        } else {
            $tax_rate = 0;
        }

        wp_enqueue_script( $script_handle, YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/yay-extra-compatible.js', $dep, YAYWHOLESALEB2B_VERSION, true );
        wp_localize_script(
            $script_handle,
            'yayWholesaleExtra',
            [
                'wholesale_role'     => $wholesale_role,
                'product_type'       => $product->get_type(),
                'sale_prices'        => $sale_prices,
                'regular_prices'     => $regular_prices,
                'currency_rate'      => empty( $currency ) || ! isset( $currency['rate'] ) ? 1 : $currency['rate'],
                // Tax handle
                'tax_enabled'        => wc_tax_enabled(),
                'prices_include_tax' => wc_prices_include_tax(),
                'tax_display_shop'   => get_option( 'woocommerce_tax_display_shop' ),
                'tax_rate'           => $tax_rate,
            ]
        );
    }
}
