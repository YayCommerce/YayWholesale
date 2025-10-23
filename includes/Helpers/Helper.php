<?php
namespace Yay_Wholesale\Helpers;

use Yay_Wholesale\Utils\SingletonTrait;

class Helper {

	use SingletonTrait;

	private static $YAY_WHOLESALE_POST_TYPE = 'yay-wholesale-manage';

	protected function __construct() {}

	public static function get_post_type() {
		return self::$YAY_WHOLESALE_POST_TYPE;
	}
}
