<?php
namespace YayWholesaleB2B\Engine\PromotionRules;

use YayWholesaleB2B\Helpers\PromotionRulesHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the monthly promotion rules evaluation cron.
 */
class PromotionRulesCron {

    use SingletonTrait;

    const CRON_HOOK = 'ywhs_promotion_rules_evaluate';

    /**
     * Wire the cron callback only. Scheduling is handled separately by
     * self::register_schedule() so it does not run on every request.
     */
    protected function __construct() {
        add_action( self::CRON_HOOK, [ PromotionRulesHelper::class, 'evaluate_promotion_rules' ] );
    }

    /**
     * Schedule the recurring daily event, if not already scheduled.
     *
     * Call this once from plugin activation (see ActDeact::single_activate()),
     * not from a hook that runs on every request.
     *
     * @return void
     */
    public static function register_schedule(): void {
        if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
            wp_schedule_event( time(), 'daily', self::CRON_HOOK );
        }
    }
}
