<?php
namespace YayWholesaleB2B\Helpers;

/**
 * Wholesale Setup Wizard Helpers
 */
class SetupWizardHelper {
    const SETUP_WIZARD_COMPLETED          = 'ywhs_setup_wizard_completed';
    const SETUP_WIZARD_REDIRECT_TRANSIENT = 'ywhs_setup_wizard_need_redirect';
    const SETUP_WIZARD_SLUG               = 'yay_wholesale_b2b#/setup-wizard';

    public static function is_setup_wizard_completed() {
        return get_option( self::SETUP_WIZARD_COMPLETED, false );
    }

    public static function mark_setup_wizard_completed() {
        if ( null !== ( get_option( self::SETUP_WIZARD_COMPLETED, null ) ) ) {
            add_option( self::SETUP_WIZARD_COMPLETED, true );
        } else {
            update_option( self::SETUP_WIZARD_COMPLETED, true );
        }
    }

    public static function init_setup_wizard() {
        add_option( self::SETUP_WIZARD_COMPLETED, false );
        set_transient( self::SETUP_WIZARD_REDIRECT_TRANSIENT, true, 60 );
    }

    public static function redirect_to_setup_wizard() {
        wp_safe_redirect( admin_url( 'admin.php?page=' . self::SETUP_WIZARD_SLUG ) );
    }
}
