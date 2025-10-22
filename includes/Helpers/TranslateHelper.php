<?php
namespace Yay_Wholesale\Helpers;

use Yay_Wholesale\Utils\SingletonTrait;

class TranslateHelper {

	use SingletonTrait;

	protected function __construct() {}

	public static function get_translations() {
		return array(
			// App
			'Dashboard' => __( 'Dashboard', 'yay-wholesale' ),
			'Request'   => __( 'Request', 'yay-wholesale' ),
			'Roles'     => __( 'Roles', 'yay-wholesale' ),
			'Settings'  => __( 'Settings', 'yay-wholesale' ),
		);
	}
}
