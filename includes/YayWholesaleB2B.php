<?php
namespace YayWholesaleB2B;

use YayWholesaleB2B\YayWholesaleB2BLicenseAdapter;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayWholesaleB2B Plugin Initializer
 */
class YayWholesaleB2B {

    use SingletonTrait;

    protected function __construct() {
        \YayWholesaleB2B\Engine\RestAPI::get_instance();
        \YayWholesaleB2B\Engine\Register\RegisterFacade::get_instance();
        \YayWholesaleB2B\Engine\Admin\Settings::get_instance();
        \YayWholesaleB2B\Engine\Admin\Users::get_instance();
        \YayWholesaleB2B\Engine\Admin\Orders::get_instance();
        \YayWholesaleB2B\Engine\Admin\Emails\Emails::get_instance();

        \YayWholesaleB2B\Engine\PromotionRules\PromotionRulesCron::get_instance();

        \YayWholesaleB2B\Engine\Frontend\Frontend::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Pricing::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Coupon::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Tax::get_instance();
        \YayWholesaleB2B\Engine\Frontend\RequestForm::get_instance();
        \YayWholesaleB2B\Engine\Frontend\Requirement::get_instance();

        \YayWholesaleB2B\Engine\Compatibles::get_instance();

        if ( self::is_pro() ) {
            \YayWholesaleB2B\Pro\YayWholesaleB2BPro::initialize();
            \YayWholesaleB2B\Pro\YayWholesaleB2BPro::register_admin_menu();
        } else {
            self::register_admin_menu();
        }
    }

    public static function initialize() {
        self::get_instance();
    }

    public static function is_pro(): bool {
        return class_exists( 'YayWholesaleB2B\Pro\YayWholesaleB2BPro', true );
    }

    public static function register_admin_menu() {
        \YayWholesaleB2BScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayWholesaleB2BLicenseAdapter()
        );
    }
}
