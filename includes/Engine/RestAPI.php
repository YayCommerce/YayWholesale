<?php
namespace Yay_Wholesale\Engine;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

class RestAPI {
	use SingletonTrait;

	protected function __construct() {

		add_action( 'rest_api_init', array( $this, 'yay_wholesale_endpoints' ) );

	}

	public function yay_wholesale_endpoints() {

		// POST /settings
		register_rest_route(
			'yay-wholesale/v1',
			'/settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'wholesale_manage_settings' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			'yay-wholesale/v1',
			'/mark-reviewed',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'mark_reviewed' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		do_action( 'YayWholesale/RestAPI/Endpoints' );
	}

	public function wholesale_manage_settings( $request ) {
		$params = $request->get_params();
		if ( $params ) {
			// save settings
			//update_option( 'yay_wholesale_settings', $params );
		}

		// Return the updated settings
		return rest_ensure_response(
			array(
				'success' => true,
				'message' => __( 'Settings saved!', 'yay-wholesale' ),
			)
		);
	}

	public function mark_reviewed() {
		update_option( 'yay_wholesale_reviewed', true );

		return rest_ensure_response( true );
	}
}
