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
        $dep           = [ 'jquery' ];
        $script_handle = 'yay-wholesale-scripts';

        wp_enqueue_script( $script_handle, YAY_WHOLESALE_PLUGIN_URL . 'assets/js/request-form-script.js', $dep, YAY_WHOLESALE_VERSION, false );
        wp_enqueue_script( 'ywhs-requirement-scripts', YAY_WHOLESALE_PLUGIN_URL . 'assets/js/wholesale-requirement-script.js', $dep, YAY_WHOLESALE_VERSION, false );
        wp_enqueue_style( 'yay-wholesale-styles', YAY_WHOLESALE_PLUGIN_URL . 'assets/css/styles.css', [], YAY_WHOLESALE_VERSION );

        wp_localize_script(
            $script_handle,
            'yayWholesale',
            [
                'rest_url'   => esc_url_raw( rest_url() ),
                'rest_nonce' => wp_create_nonce( 'wp_rest' ),
                'rest_base'  => 'yay-wholesale/v1',
            ]
        );
    }
}
