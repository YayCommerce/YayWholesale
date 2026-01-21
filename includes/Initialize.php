<?php
namespace Yay_Wholesale_B2B;

use Yay_Wholesale_B2B\Utils\SingletonTrait;

/**
 * Yay_Wholesale_B2B Plugin Initializer
 */
class Initialize {

    use SingletonTrait;

    /**
     * The Constructor that load the engine classes
     */
    protected function __construct() {
        \Yay_Wholesale_B2B\Engine\Hooks::get_instance();
        \Yay_Wholesale_B2B\Engine\RestAPI::get_instance();
        \Yay_Wholesale_B2B\Engine\Compatibles::get_instance();
        \Yay_Wholesale_B2B\Engine\Register\RegisterFacade::get_instance();
        \Yay_Wholesale_B2B\Engine\Admin\Settings::get_instance();
        \Yay_Wholesale_B2B\Engine\Admin\Users::get_instance();
        \Yay_Wholesale_B2B\Engine\Admin\Orders::get_instance();
        \Yay_Wholesale_B2B\Engine\Admin\Emails\Emails::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\Frontend::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\Pricing::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\Coupon::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\Tax::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\RequestForm::get_instance();
        \Yay_Wholesale_B2B\Engine\Frontend\Requirement::get_instance();
    }
}
