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
		// Engine
		Helper::get_instance_classes( array( '\Yay_Wholesale', 'Engine' ), Helper::engine_classes() );
		// Register
		Helper::get_instance_classes( array( '\Yay_Wholesale', 'Engine', 'Register' ), Helper::register_classes() );
		// BEPages
		Helper::get_instance_classes( array( '\Yay_Wholesale', 'Engine', 'BEPages' ), Helper::backend_classes() );

	}
}
