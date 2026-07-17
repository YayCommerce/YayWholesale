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

    const CRON_HOOK  = 'ywhs_promotion_rules_evaluate';
    const CRON_BATCH = 'ywhs_promotion_rules_batch';

    protected function __construct() {
        // add the cron hook
        add_action( self::CRON_HOOK, [ $this, 'run' ] );

        // add the batch cron hook
        add_action( self::CRON_BATCH, [ PromotionRulesHelper::class, 'schedule_batch' ], 10, 2 );
    }

    /**
     * Execute the promotion rules evaluation and schedule the next run.
     *
     * @return void
     */
    public function run(): void {
        try {
            // evaluate the promotion rules
            PromotionRulesHelper::evaluate_promotion_rules();
        } finally {
            // schedule the next evaluation
            self::register_schedule();
        }
    }

    /**
     * Schedule the next evaluation on the first day of the next month.
     *
     * Safe to call multiple times because it only schedules the event
     * when there is no pending scheduled event.
     *
     * @return void
     */
    public static function register_schedule(): void {
        // check if the cron is already scheduled
        if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
            $first_day_of_next_month = current_datetime()->modify( 'first day of next month midnight' )->getTimestamp();
            // schedule the cron event
            wp_schedule_single_event(
                $first_day_of_next_month,
                self::CRON_HOOK
            );
        }
    }
}
