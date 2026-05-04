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
                    'callback'            => [ $this, 'statistic_wholesalers' ],
                    'permission_callback' => [ $this, 'can_manage_report' ],
                ],
            ]
        );
    }

    /**
     * Statistic the wholesale customers and orders.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response object.
     */
    public function statistic_wholesalers( WP_REST_Request $request ): WP_REST_Response {
        $start_date         = $request['startDate'];
        $end_date           = $request['endDate'];
        $compare_start_date = $request['compareStartDate'];
        $compare_end_date   = $request['compareEndDate'];

        $ywhs_statistic = ReportsHelper::get_statictis_data(
            $compare_start_date,
            $compare_end_date,
            $start_date,
            $end_date
        );

        return $this->success( $ywhs_statistic, __( 'Reports generated!', 'yay-wholesale-b2b' ) );
    }

    /**
     * Check if the user has the necessary permissions to access the reports endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function can_manage_report() {
        if ( ! current_user_can( 'edit_posts' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
    }
}
