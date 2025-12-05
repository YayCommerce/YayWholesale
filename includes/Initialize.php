<?php
namespace Yay_Wholesale;

use Yay_Wholesale\Utils\SingletonTrait;

/**
 * Yay_Wholesale Plugin Initializer
 */
class Initialize {

    use SingletonTrait;

    /**
     * The Constructor that load the engine classes
     */
    protected function __construct() {
        \Yay_Wholesale\Engine\Hooks::get_instance();
        \Yay_Wholesale\Engine\RestAPI::get_instance();
        \Yay_Wholesale\Engine\Register\RegisterFacade::get_instance();
        \Yay_Wholesale\Engine\Admin\Settings::get_instance();
        \Yay_Wholesale\Engine\Admin\Users::get_instance();
        \Yay_Wholesale\Engine\Admin\Emails\Emails::get_instance();
        \Yay_Wholesale\Engine\Frontend\Frontend::get_instance();
        \Yay_Wholesale\Engine\Frontend\Pricing::get_instance();
        \Yay_Wholesale\Engine\Frontend\Coupon::get_instance();
        \Yay_Wholesale\Engine\Frontend\Tax::get_instance();
        \Yay_Wholesale\Engine\Frontend\RequestForm::get_instance();
        \Yay_Wholesale\Engine\Admin\Orders::get_instance();
        \Yay_Wholesale\Engine\Frontend\Requirement::get_instance();
    }
}
