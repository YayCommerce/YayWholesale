<?php
namespace YayWholesaleB2B\Helpers;

/**
 * Wholesale Setup Wizard Helpers
 */
class SetupWizardHelper {
    const SETUP_WIZARD                    = 'yaywholesaleb2b_setup_wizard';
    const SETUP_WIZARD_REDIRECT_TRANSIENT = 'yaywholesaleb2b_setup_wizard_need_redirect';
    const SETUP_WIZARD_SLUG               = 'yay_wholesale_b2b#/setup-wizard';

    // Setup Wizard status
    const SETUP_FRESH_STATUS     = 'fresh';
    const SETUP_SKIPPED_STATUS   = 'skipped';
    const SETUP_COMPLETED_STATUS = 'complated';

    private const VALID_STATUSES = [
        self::SETUP_FRESH_STATUS,
        self::SETUP_SKIPPED_STATUS,
        self::SETUP_COMPLETED_STATUS,
    ];

    protected static function get_default_data() {
        return [
            'status' => 'fresh',
        ];
    }

    public static function get_setup_wizard_option() {
        return array_replace_recursive( self::get_default_data(), get_option( self::SETUP_WIZARD, [] ) );
    }

    public static function save_setup_wizard_option( array $data ) {
        update_option( self::SETUP_WIZARD, $data );
    }

    public static function mark_setup_wizard_status( string $status ) {
        if ( ! in_array( $status, self::VALID_STATUSES, true ) ) {
            return;
        }

        $option           = self::get_setup_wizard_option();
        $option['status'] = $status;
        update_option( self::SETUP_WIZARD, $option );
    }

    public static function is_setup_wizard_fresh() {
        $option = self::get_setup_wizard_option();
        return 'fresh' === $option['status'];
    }

    public static function init_setup_wizard() {
        update_option( self::SETUP_WIZARD, self::get_default_data() );
        set_transient( self::SETUP_WIZARD_REDIRECT_TRANSIENT, true, 60 );
    }

    public static function redirect_to_setup_wizard() {
        wp_safe_redirect( admin_url( 'admin.php?page=' . self::SETUP_WIZARD_SLUG ) );
    }
}
