<?php
namespace Yay_Wholesale\Engine\Register;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Engine\Register\ScriptName;

/** Register in Production Mode */
class RegisterProd {
	use SingletonTrait;

	/** Hooks Initialization */
	protected function __construct() {
		add_action( 'init', array( $this, 'register_all_scripts' ) );
	}

	public function register_all_scripts() {
		$deps = array( 'react', 'react-dom', 'wp-hooks', 'wp-i18n' );
		wp_register_script( ScriptName::PAGE_SETTINGS, YAY_WHOLESALE_PLUGIN_URL . 'assets/dist/js/main.js', $deps, YAY_WHOLESALE_VERSION, true );
	}
}
