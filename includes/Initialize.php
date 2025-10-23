<?php
namespace Yay_Wholesale;

use Yay_Wholesale\Helpers\Helper;
use Yay_Wholesale\Utils\SingletonTrait;

/**
 * Yay_Wholesale Plugin Initializer
 */
class Initialize {

	use SingletonTrait;

	/**
	 * The Constructor that load the engine classes
	 */
	protected function __construct() {
		\Yay_Wholesale\Engine\Hooks::get_instance();
		\Yay_Wholesale\Engine\RestAPI::get_instance();
		\Yay_Wholesale\Engine\Register\RegisterFacade::get_instance();
		\Yay_Wholesale\Engine\BEPages\Settings::get_instance();
	}
}
