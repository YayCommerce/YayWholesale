<?php
namespace YayWholesaleB2B\Engine;

use YayWholesaleB2B\Controllers\ReportsRestController;
use YayWholesaleB2B\Controllers\RequestRestController;
use YayWholesaleB2B\Controllers\RolesRestController;
use YayWholesaleB2B\Controllers\SettingsRestController;
use YayWholesaleB2B\Controllers\WholeSalersController;
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
        SettingsRestController::get_instance();
        RolesRestController::get_instance();
        RequestRestController::get_instance();
        WholeSalersController::get_instance();
        ReportsRestController::get_instance();
    }
}
