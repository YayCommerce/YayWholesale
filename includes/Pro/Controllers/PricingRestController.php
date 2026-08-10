<?php
namespace YayWholesaleB2B\Pro\Controllers;

use WP_Error;
use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Controllers\BaseRestController;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\CsvPricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Pricing API endpoints.
 */
class PricingRestController extends BaseRestController {
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
                'permission_callback' => [ $this, 'can_manage_pricing' ],
            ],
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/pricing/import',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'import_product_pricing' ],
                'permission_callback' => [ $this, 'can_manage_pricing' ],
            ],
        );
    }

    public function export_product_pricing( WP_REST_Request $request ) {
        $filename   = '';
        $cached_csv = CsvPricingHelper::get_cached_csv();
        if ( empty( $cached_csv ) ) {
            $filename = CsvPricingHelper::build_csv();
        } else {
            $filename = $cached_csv;
        }

        return [ 'file' => YAYWHOLESALEB2B_PLUGIN_URL . $filename . '?q=' . gmdate( 'YmdHis' ) ];
    }

    public function import_product_pricing( WP_REST_Request $request ) {
        $file = $request->get_file_params();

        if ( empty( $file['file'] ) ) {
            return $this->error_invalid_arguments();
        }

        $logs = CsvPricingHelper::apply_csv( $file['file']['tmp_name'] );

        return [ 'logs' => $logs ];
    }

    public function can_manage_pricing() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
