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
        wp_enqueue_style( 'yay-wholesale-styles', YAY_WHOLESALE_PLUGIN_URL . 'assets/css/styles.css', [], YAY_WHOLESALE_VERSION );
    }
}
