<?php
namespace Yay_Wholesale_B2B\Engine;

use Yay_Wholesale_B2B\Controllers\ReportsRestController;
use Yay_Wholesale_B2B\Controllers\RequestRestController;
use Yay_Wholesale_B2B\Controllers\RolesRestController;
use Yay_Wholesale_B2B\Controllers\SettingsRestController;
use Yay_Wholesale_B2B\Controllers\WholeSalersController;
use Yay_Wholesale_B2B\Utils\SingletonTrait;


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
