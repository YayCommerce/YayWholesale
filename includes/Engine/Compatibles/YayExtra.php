<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use WC_Tax;
use YayWholesaleB2B\Helpers\CustomerHelper;
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
    }

    public function enqueue_scripts() {
        if ( ! is_product() ) {
            return;
        }
        $dep           = [ 'jquery', 'wp-i18n', 'wp-hooks' ];
        $script_handle = 'yay-extra-compatible';

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        $product        = wc_get_product( get_the_ID() );

        $currency      = apply_filters( 'ywhs_get_currency_by_third_party', [] );
        $sale_price    = $product->get_sale_price();
        $regular_price = $product->get_regular_price();

        $tax_class = $product->get_tax_class();
        $tax_rates = WC_Tax::get_rates( $tax_class );

        if ( ! empty( $tax_rates ) ) {
            $first_rate = reset( $tax_rates );
            $tax_rate   = $first_rate['rate'];
        } else {
            $tax_rate = 0;
        }

        wp_enqueue_script( $script_handle, YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/yay-extra-compatible.js', $dep, YAYWHOLESALEB2B_VERSION, false );
        wp_localize_script(
            $script_handle,
            'yayWholesaleExtra',
            [
                'wholesale_role'     => $wholesale_role,
                'sale_price'         => $sale_price,
                'regular_price'      => $regular_price,
                'currency_rate'      => empty( $currency ) ? 1 : $currency['rate'],
                // Tax handle
                'tax_enabled'        => wc_tax_enabled(),
                'prices_include_tax' => wc_prices_include_tax(),
                'tax_display_shop'   => get_option( 'woocommerce_tax_display_shop' ),
                'tax_rate'           => $tax_rate,
            ]
        );
    }
}
