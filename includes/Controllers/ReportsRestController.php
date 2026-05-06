<?php
namespace YayWholesaleB2B\Controllers;

use DateTime;
use YayWholesaleB2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use YayWholesaleB2B\Helpers\ReportsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Settings API endpoints.
 */
class ReportsRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/reports',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'get_wholesale_report' ],
                    'permission_callback' => [ $this, 'can_manage_report' ],
                ],
            ]
        );
    }

    public function get_wholesale_report( WP_REST_Request $request ) {
        $start_date         = $request->get_param( 'startDate' );
        $end_date           = $request->get_param( 'endDate' );
        $compare_start_date = $request->get_param( 'compareStartDate' );
        $compare_end_date   = $request->get_param( 'compareEndDate' );

        $wholesale_report = ReportsHelper::get_wholesale_report(
            $compare_start_date,
            $compare_end_date,
            $start_date,
            $end_date
        );

        return $wholesale_report;
    }

    public function can_manage_report() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return $this->error_forbidden();
        }

        return true;
    }
}
