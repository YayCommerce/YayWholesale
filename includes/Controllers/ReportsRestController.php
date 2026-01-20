<?php
namespace Yay_Wholesale_B2B\Controllers;

use DateTime;
use Yay_Wholesale_B2B\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale_B2B\Helpers\ReportsHelper;

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
            $this->namespace,
            '/reports',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [ $this, 'statistic_wholesalers' ],
                    'permission_callback' => [ $this, 'reports_permission_callback' ],
                ],
            ]
        );
    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function reports_permission_callback() {
        if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'manage_woocommerce' ) ) {
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale-b2b' ), [ 'status' => 401 ] );
        }

        return true;
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

        $default_date_range = ReportsHelper::get_ywhs_report_date_transient();

        if ( ! isset( $start_date ) ) {
            $start_date         = $default_date_range['default_start_date'];
            $compare_start_date = $default_date_range['default_compare_start_date'];
        }

        if ( ! isset( $end_date ) ) {
            $end_date         = $default_date_range['default_end_date'];
            $compare_end_date = $default_date_range['default_compare_end_date'];
        }

        $ywhs_transient_key = ReportsHelper::get_ywhs_default_report_key(
            $compare_start_date,
            $compare_end_date,
            $start_date,
            $end_date
        );

        $ywhs_transient = get_transient( $ywhs_transient_key );
        if ( false !== $ywhs_transient ) {
            return $this->success( $ywhs_transient, __( 'Reports generated!', 'yay-wholesale-b2b' ) );
        }

        $ywhs_statistic = ReportsHelper::statistic_data( $start_date, $end_date, $compare_start_date, $compare_end_date );

        if ( $start_date === $default_date_range['default_start_date'] &&
            $end_date === $default_date_range['default_end_date'] &&
            $compare_start_date === $default_date_range['default_compare_start_date'] &&
            $compare_end_date === $default_date_range['default_compare_end_date'] ) {
            set_transient( $ywhs_transient_key, $ywhs_statistic, 600 );
        }

        return $this->success( $ywhs_statistic, __( 'Reports generated!', 'yay-wholesale-b2b' ) );
    }
}
