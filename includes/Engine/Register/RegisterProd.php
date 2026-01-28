<?php
namespace YayWholesaleB2B\Engine\Register;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Engine\Register\ScriptName;

/** Register in Production Mode */
class RegisterProd {
    use SingletonTrait;

    /** Hooks Initialization */
    protected function __construct() {
        add_action( 'init', [ $this, 'register_all_scripts' ] );
    }

    public function register_all_scripts() {
        $deps = [ 'react', 'react-dom', 'wp-hooks', 'wp-i18n' ];
        wp_register_script( ScriptName::PAGE_SETTINGS, YAYWHOLESALEB2B_PLUGIN_URL . 'assets/dist/admin/js/main.js', $deps, YAYWHOLESALEB2B_VERSION, true );
        wp_set_script_translations( ScriptName::PAGE_SETTINGS, 'yay-wholesale-b2b', YAYWHOLESALEB2B_PLUGIN_DIR . 'languages' );
    }
}
