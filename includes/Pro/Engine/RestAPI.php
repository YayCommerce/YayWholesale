<?php
namespace YayWholesaleB2B\Pro\Engine;

use YayWholesaleB2B\Pro\Controllers\ToolsRestController;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Class RestAPI
 *
 * Handles Yay Wholesale REST API endpoints.
 */
class RestAPI {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'rest_api_init', [ $this, 'wholesale_endpoints' ] );
    }

    public function wholesale_endpoints() {
        ToolsRestController::get_instance();
    }
}
