<?php
namespace YayWholesaleB2B\Engine\Admin\Emails;

use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Emails Engine
 */
class Emails {
    use SingletonTrait;

    protected function __construct() {
        // Register email classes
        add_filter( 'woocommerce_email_classes', [ $this, 'ywhs_register_email_classes' ] );
        add_filter( 'woocommerce_email_actions', [ $this, 'ywhs_register_email_actions' ] );

        // Preview emails
        add_filter( 'woocommerce_email_preview_placeholders', [ $this, 'email_preview_placeholders' ], 10, 3 );
    }

    public function ywhs_register_email_classes( $email_classes ) {
        $email_classes['YayWholesaleB2B_New_Order_Placed']              = new NewOrderPlaced();
        $email_classes['YayWholesaleB2B_New_Account_Registered']        = new NewAccountRegistered();
        $email_classes['YayWholesaleB2B_Account_Registration_Approved'] = new AccountRegistrationApproved();
        $email_classes['YayWholesaleB2B_Account_Registration_Rejected'] = new AccountRegistrationRejected();
        $email_classes['YayWholesaleB2B_Account_Registration_Pending']  = new AccountRegistrationPending();

        return $email_classes;
    }

    /**
     * Register email actions.
     *
     * @param array $actions
     * @return array
     */
    /**
     * Register the actions which trigger the mails
     *
     * @param array $actions
     * @return array $new_actions
     */
    public function ywhs_register_email_actions( $actions ) {
        $new_actions = array_merge(
            $actions,
            [
                'ywhs_new_wholesale_order_placed',
                'ywhs_new_account_registered',
                'ywhs_account_registration_pending',
                'ywhs_account_registration_rejected',
                'ywhs_account_registration_approved',

            ]
        );

        return $new_actions;
    }

    public function email_preview_placeholders( $placeholders, $email_type, $email_object ) {

        if ( is_a( $email_object, 'WC_Order' ) ) {
            $billing_full_name                  = $email_object->get_formatted_billing_full_name();
            $placeholders['{customer_name}']    = $billing_full_name;
            $placeholders['{account_name}']     = $billing_full_name;
            $placeholders['{user_login}']       = $email_object->get_billing_email();
            $placeholders['{set_password_url}'] = admin_url( 'profile.php?action=yay_wholesale_set_password' );
        }
        return $placeholders;
    }
}
