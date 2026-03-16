<?php
namespace YayWholesaleB2B;

use YayWholesaleB2B\Utils\SingletonTrait;

/**
 * YayWholesaleB2B Plugin Initializer
 */
class Initialize {

    use SingletonTrait;

    /**
     * The Constructor that load the engine classes
     */
    protected function __construct() {
        \YayWholesaleB2B\Engine\Hooks::get_instance();
        \YayWholesaleB2B\Engine\RestAPI::get_instance();
        \YayWholesaleB2B\Engine\Compatibles::get_instance();
        \YayWholesaleB2B\Engine\Register\RegisterFacade::get_instance();
        \YayWholesaleB2B\Engine\Admin\Settings::get_instance();
        \YayWholesaleB2B\Engine\Admin\Users::get_instance();
        \YayWholesaleB2B\Engine\Admin\Orders::get_instance();
        \YayWholesaleB2B\Engine\Admin\Emails\Emails::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Frontend::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Pricing::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Coupon::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Tax::get_instance();
        \YayWholesaleB2B\Engine\Frontend\RequestForm::get_instance();
    }
}
