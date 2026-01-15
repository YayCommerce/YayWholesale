<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Frontend  Class
 */
class Frontend {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
    }

    public function enqueue_scripts() {
        $dep           = [ 'jquery', 'wp-i18n' ];
        $script_handle = 'yay-wholesale-scripts';

        wp_enqueue_script( $script_handle, YAY_WHOLESALE_PLUGIN_URL . 'assets/js/request-form-script.js', $dep, YAY_WHOLESALE_VERSION, false );
        wp_enqueue_script( 'ywhs-requirement-scripts', YAY_WHOLESALE_PLUGIN_URL . 'assets/js/wholesale-requirement-script.js', $dep, YAY_WHOLESALE_VERSION, false );
        wp_enqueue_style( 'yay-wholesale-styles', YAY_WHOLESALE_PLUGIN_URL . 'assets/css/front_store_styles.css', [], YAY_WHOLESALE_VERSION );

        $currency         = apply_filters( 'ywhs_get_currency_by_third_party', [] );
        $default_currency = apply_filters( 'ywhs_ajax_using_default_currency', false );
        if ( ! empty( $currency ) && ! $default_currency ) {
            $currency_data = [
                'currency'     => $currency['currency'],
                'symbol'       => html_entity_decode( $currency['symbol'], ENT_COMPAT ),
                'position'     => $currency['position'],
                'thousand_sep' => $currency['thousand_sep'],
                'decimal_sep'  => $currency['decimal_sep'],
                'num_decimals' => intval( $currency['num_decimals'] ),
            ];
        } else {
            $currency_data = [
                'currency'     => get_woocommerce_currency(),
                'symbol'       => html_entity_decode( \get_woocommerce_currency_symbol(), ENT_COMPAT ),
                'position'     => get_option( 'woocommerce_currency_pos' ),
                'thousand_sep' => get_option( 'woocommerce_price_thousand_sep' ),
                'decimal_sep'  => get_option( 'woocommerce_price_decimal_sep' ),
                'num_decimals' => intval( get_option( 'woocommerce_price_num_decimals' ) ),
            ];
        }//end if

        wp_localize_script(
            $script_handle,
            'yayWholesale',
            [
                'rest_url'      => esc_url_raw( rest_url() ),
                'rest_nonce'    => wp_create_nonce( 'wp_rest' ),
                'rest_base'     => 'yay-wholesale/v1',
                'currency_data' => $currency_data,
            ]
        );
    }
}
