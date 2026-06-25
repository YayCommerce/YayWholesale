<?php
namespace YayWholesaleB2B\Helpers;

/**
 * Wholesale Setup Wizard Helpers
 */
class SetupWizardHelper {
    const SETUP_WIZARD_STATUS             = 'yaywholesaleb2b_setup_wizard_status';
    const SETUP_WIZARD_REDIRECT_TRANSIENT = 'yaywholesaleb2b_setup_wizard_need_redirect';
    const SETUP_WIZARD_SLUG               = 'yay_wholesale_b2b#/setup-wizard';

    /**
     * @return 'fresh'|'skipped'|'completed'
     */
    public static function get_setup_wizard_status() {
        return get_option( self::SETUP_WIZARD_STATUS, 'fresh' );
    }

    /**
     *
     * @param 'fresh'|'skipped'|'completed' $status .
     */
    public static function save_setup_wizard_status( $status ) {
        update_option( self::SETUP_WIZARD_STATUS, $status );
    }


    public static function init_setup_wizard() {
        update_option( self::SETUP_WIZARD_STATUS, 'fresh' );
        set_transient( self::SETUP_WIZARD_REDIRECT_TRANSIENT, true, 60 );
    }

    public static function redirect_to_setup_wizard() {
        wp_safe_redirect( admin_url( 'admin.php?page=' . self::SETUP_WIZARD_SLUG ) );
    }
}
