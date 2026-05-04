<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Services\LocalizeService;

defined( 'ABSPATH' ) || exit;
/**
 * Frontend  Class
 */
class Frontend {
    use SingletonTrait;

    private LocalizeService $localize_service;

    protected function __construct() {
        $this->localize_service = LocalizeService::get_instance();

        add_action( 'wp_enqueue_scripts', [ $this, 'ywhs_enqueue_scripts' ] );
    }

    public function ywhs_enqueue_scripts() {
        $dep           = [ 'jquery', 'wp-i18n' ];
        $script_handle = 'yay-wholesale-scripts';

        wp_enqueue_script( $script_handle, YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/request-form-script.js', $dep, YAYWHOLESALEB2B_VERSION, false );
        wp_enqueue_script( 'ywhs-requirement-scripts', YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/wholesale-requirement-script.js', $dep, YAYWHOLESALEB2B_VERSION, false );
        wp_enqueue_style( 'yay-wholesale-styles', YAYWHOLESALEB2B_PLUGIN_URL . 'assets/css/front_store_styles.css', [], YAYWHOLESALEB2B_VERSION );

        $currency         = apply_filters( 'ywhs_get_currency_by_third_party', [] );
        $default_currency = apply_filters( 'ywhs_ajax_using_default_currency', false );

        $meta = $this->localize_service->get_meta();
        if ( ! empty( $currency ) && ! $default_currency ) {
            $meta['wcMeta']['currency_data'] = [
                'currency'     => $currency['currency'],
                'symbol'       => html_entity_decode( $currency['symbol'], ENT_COMPAT ),
                'position'     => $currency['position'],
                'thousand_sep' => $currency['thousand_sep'],
                'decimal_sep'  => $currency['decimal_sep'],
                'num_decimals' => intval( $currency['num_decimals'] ),
            ];
        }

        wp_localize_script(
            $script_handle,
            LocalizeService::VAR_META,
            $meta,
        );
    }
}
