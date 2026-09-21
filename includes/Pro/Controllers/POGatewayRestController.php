<?php
namespace YayWholesaleB2B\Pro\Controllers;

use YayWholesaleB2B\Controllers\BaseRestController;
use YayWholesaleB2B\Pro\Helpers\POGatewayHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * PO Gateway REST Controller — pre-uploads the PO attachment for the Checkout
 * block (Store API is JSON-only, so the file can't travel with the order payload).
 */
class POGatewayRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        register_rest_route(
            self::REST_NAMESPACE,
            '/po-gateway/attachment',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'upload_attachment' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        );
    }

    public function check_permission() {
        return is_user_logged_in();
    }

    public function upload_attachment( \WP_REST_Request $request ) {
        return $this->exec_write(
            function ( \WP_REST_Request $request ) {
                $files = $request->get_file_params();
                $file  = $files['file'] ?? null;

                if ( empty( $file ) ) {
                    return $this->error_invalid_arguments( __( 'No file uploaded.', 'yay-wholesale-b2b' ) );
                }

                $result = POGatewayHelper::upload_attachment( $file );
                if ( is_wp_error( $result ) ) {
                    return $result;
                }

                return $result;
            },
            $request
        );
    }
}
