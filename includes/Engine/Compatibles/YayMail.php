<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationApproved;
use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationPending;
use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationRejected;
use YayWholesaleB2B\Engine\Compatibles\YayMail\NewAccountRegistered;
use YayWholesaleB2B\Engine\Compatibles\YayMail\NewOrderPlaced;
use YayWholesaleB2B\Engine\Compatibles\YayMail\RequestShortcode;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * YayMail Compatible
 */
class YayMail {
    use SingletonTrait;

    protected function __construct() {
        if ( ! defined( 'YAYMAIL_VERSION' ) ) {
            return;
        }

        add_action( 'yaymail_register_emails', [ $this, 'register_yay_emails' ] );
        add_action( 'yaymail_register_shortcodes', [ $this, 'register_shortcodes' ] );
    }

    public function register_yay_emails( $yaymail_emails ) {
        $yaymail_emails->register( NewOrderPlaced::get_instance() );
        $yaymail_emails->register( NewAccountRegistered::get_instance() );
        $yaymail_emails->register( AccountRegistrationPending::get_instance() );
        $yaymail_emails->register( AccountRegistrationApproved::get_instance() );
        $yaymail_emails->register( AccountRegistrationRejected::get_instance() );
    }

    public function register_shortcodes() {
        RequestShortcode::get_instance();
    }
}
