<?php
namespace Yay_Wholesale\Controllers;

use DateTime;
use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale\Helpers\ReportsHelper;

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
                    'methods'  => 'GET',
                    'callback' => [ $this, 'statistic_wholesalers' ],
                    // 'permission_callback' => [ $this, 'reports_permission_callback' ],
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
            return new \WP_Error( 'rest_forbidden', esc_html__( 'Forbidden.', 'yay-wholesale' ), [ 'status' => 401 ] );
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

        if ( ! isset( $start_date ) ) {
            $date = new DateTime();
            $date->modify( '-30 days' );
            $start_date         = $date->format( 'Y-m-d' );
            $compare_start_date = $date->modify( '-31 days' )->format( 'Y-m-d' );
        }

        if ( ! isset( $end_date ) ) {
            $now              = new DateTime();
            $end_date         = $now->format( 'Y-m-d' );
            $compare_end_date = $now->modify( '-31 days' )->format( 'Y-m-d' );
        }

        $transient = get_transient( ReportsHelper::REPORT_TRANSIENT );
        if ( false !== $transient &&
            $start_date === $transient['start_date'] &&
            $end_date === $transient['end_date'] &&
            $compare_start_date === $transient['compare_start_date'] &&
            $compare_end_date === $transient['compare_end_date'] ) {
            return $this->success( $transient['data'], __( 'Reports generated!', 'yay-wholesale' ) );
        }

        $statistic = ReportsHelper::statistic_data( $start_date, $end_date, $compare_start_date, $compare_end_date );

        $transient = [
            'start_date'         => $start_date,
            'end_date'           => $end_date,
            'data'               => $statistic,
            'compare_start_date' => $compare_start_date,
            'compare_end_date'   => $compare_end_date,
        ];
        set_transient( ReportsHelper::REPORT_TRANSIENT, $transient, 600 );

        return $this->success( $statistic, __( 'Reports generated!', 'yay-wholesale' ) );
    }
}
