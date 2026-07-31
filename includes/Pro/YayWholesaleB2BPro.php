<?php
namespace YayWholesaleB2B\Pro;

use YayWholesaleB2B\Pro\Engine\Admin\PromotionRulesCron;
use YayWholesaleB2B\Pro\YayWholesaleB2BProLicenseAdapter;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Pro Features Initalize
 */
class YayWholesaleB2BPro {
    use SingletonTrait;

    protected function __construct() {
        if ( ! YayWholesaleB2BProLicenseAdapter::is_licensed() ) {
            return;
        }

        \YayWholesaleB2B\Pro\Engine\Frontend\PaymentGateway::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\ShippingMethod::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\Requirement::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\Pricing::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\AccessRestriction::get_instance();
        \YayWholesaleB2B\Pro\Engine\Frontend\StorePage::get_instance();

        \YayWholesaleB2B\Pro\Engine\Admin\ProductBasedRule::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\CategoryBasedRule::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\PaymentGateway::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\ShippingMethod::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\TemplateEditor::get_instance();
        \YayWholesaleB2B\Pro\Engine\Admin\PromotionRulesCron::get_instance();

        \YayWholesaleB2B\Pro\Engine\Support\Support::get_instance();
    }

    public static function initialize() {
        self::get_instance();
    }

    public static function register_admin_menu() {
        \YayWholesaleB2BScoped\YayCommerce\AdminShell\AdminShell::register_plugin(
            new YayWholesaleB2BProLicenseAdapter()
        );
    }

    public static function activate() {
        // Register the promotion rules cron schedule.
        PromotionRulesCron::register_schedule();
    }

    public static function deactivate() {
        // Clear the promotion rules cron schedule .
        wp_clear_scheduled_hook( PromotionRulesCron::CRON_HOOK );
    }
}
