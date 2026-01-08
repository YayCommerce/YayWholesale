<?php
namespace Yay_Wholesale\Controllers;

use DateTime;
use Yay_Wholesale\Utils\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;
use Yay_Wholesale\Engine\Frontend\Pricing;
use Yay_Wholesale\Helpers\ReportsHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Handles Wholesale Settings API endpoints.
 */
class PricesRestController extends BaseRestController {
    use SingletonTrait;

    protected function __construct() {
        $this->init_hooks();
    }

    protected function init_hooks(): void {
        register_rest_route(
            $this->namespace,
            '/prices',
            [
                [
                    'methods'             => 'POST',
                    'callback'            => [ $this, 'get_original_prices' ],
                    'permission_callback' => [ $this, 'prices_permission_callback' ],
                ],
            ]
        );
    }

    /**
     * Check if the user has the necessary permissions to access the settings endpoints.
     *
     * @return bool|WP_Error True if the user has the necessary permissions, otherwise a WP_Error object.
     */
    public function prices_permission_callback() {
        if ( ! is_user_logged_in() ) {
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
    public function get_original_prices( WP_REST_Request $request ): WP_REST_Response {
        $params      = $this->get_json_params( $request );
        $product_ids = $params['productIds'];

        remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            remove_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            remove_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

            $price_map = [];
        foreach ( $product_ids as $id ) {
            $product          = wc_get_product( $id );
            $price_map[ $id ] = $product->get_price();
        }

            add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            add_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            add_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

        return $this->success( $price_map, __( 'Price map fetched successfully!', 'yay-wholesale' ) );
    }
}
