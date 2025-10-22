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

	public static function get_instance_classes( $namespace_parts = array(), $classes = array() ) {
		foreach ( $classes as $class ) {
			$namespace_parts[] = $class;
			$full_class_name   = implode( '\\', $namespace_parts );
			if ( class_exists( $full_class_name ) ) {
				$full_class_name::get_instance();
			}
			array_pop( $namespace_parts );
		}
	}

	public static function engine_classes() {
		$classes = array(
			'Hooks',
			'RestAPI',
		);

		return $classes;
	}

	public static function register_classes() {
		$classes = array(
			'RegisterFacade',
		);

		return $classes;
	}

	public static function backend_classes() {
		$classes = array(
			'Settings',
		);

		return $classes;
	}
}
