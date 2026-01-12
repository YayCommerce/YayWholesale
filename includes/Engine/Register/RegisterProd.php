<?php
namespace Yay_Wholesale\Engine\Register;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Engine\Register\ScriptName;

/** Register in Production Mode */
class RegisterProd {
    use SingletonTrait;

    /** Hooks Initialization */
    protected function __construct() {
        add_action( 'init', [ $this, 'register_all_scripts' ] );
    }

    public function register_all_scripts() {
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n' ];
        wp_register_script( ScriptName::PAGE_SETTINGS, YAY_WHOLESALE_PLUGIN_URL . 'assets/dist/admin/js/main.js', $deps, YAY_WHOLESALE_VERSION, true );
        wp_set_script_translations( ScriptName::PAGE_SETTINGS, 'yay-wholesale-b2b', YAY_WHOLESALE_PLUGIN_DIR . 'languages' );
    }
}
