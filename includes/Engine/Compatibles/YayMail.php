<?php
namespace Yay_Wholesale\Engine\Compatibles;

use Yay_Wholesale\Engine\Compatibles\YayMail\AccountRegistrationApproved;
use Yay_Wholesale\Engine\Compatibles\YayMail\AccountRegistrationPending;
use Yay_Wholesale\Engine\Compatibles\YayMail\AccountRegistrationRejected;
use Yay_Wholesale\Engine\Compatibles\YayMail\NewAccountRegistered;
use Yay_Wholesale\Engine\Compatibles\YayMail\NewOrderPlaced;
use Yay_Wholesale\Engine\Compatibles\YayMail\RequestShortcode;
use Yay_Wholesale\Utils\SingletonTrait;

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
