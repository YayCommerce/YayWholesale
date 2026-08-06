<?php
namespace YayWholesaleB2B\Pro\Controllers;

use WP_Error;
use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Controllers\BaseRestController;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\ProductPricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Tools API endpoints.
 */
class ToolsRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/pricing/export',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'export_product_pricing' ],
                'permission_callback' => [ $this, 'can_manage_tools' ],
            ],
        );

        // register_rest_route(
        // self::REST_NAMESPACE,
        // '/pricing/import',
        // [
        // 'methods'             => 'POST',
        // 'callback'            => [ $this, 'import_product_pricing' ],
        // 'permission_callback' => [ $this, 'can_manage_tools' ],
        // ],
        // );
    }

    public function export_product_pricing( WP_REST_Request $request ) {
        $filename   = '';
        $cached_csv = ProductPricingHelper::get_cached_csv();
        if ( empty( $cached_csv ) ) {
            $filename = ProductPricingHelper::build_csv();
        } else {
            $filename = $cached_csv;
        }

        // $response = new WP_REST_Response();

        // $response->header( 'Content-Type', 'text/csv; charset=utf-8' );
        // $response->header( 'Content-Disposition', 'attachment; filename="' . $filename . '"' );
        // $response->header( 'Pragma', 'no-cache' );
        // $response->header( 'Expires', '0' );
        // $response->header( 'Content-Length', strlen( $content ) );

        // echo esc_html( $content );

        // // Add UTF-8 BOM
        // $response->set_data( chr( 0xEF ) . chr( 0xBB ) . chr( 0xBF ) . $content );

        return [ 'file' => YAYWHOLESALEB2B_PLUGIN_URL . $filename . '?q=' . gmdate( 'Ymd' ) ];
    }

    // public function import_product_pricing(WP_REST_Request $request) {

    // }

    public function can_manage_tools() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
