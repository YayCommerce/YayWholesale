<?php
namespace Yay_Wholesale\Engine\Admin\Emails;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Emails Engine
 */
class Emails {
    use SingletonTrait;

    protected function __construct() {
        // Register email classes
        add_filter( 'woocommerce_email_classes', [ $this, 'yay_wholesale_register_email_classes' ] );
        add_filter( 'woocommerce_email_actions', [ $this, 'yay_wholesale_register_email_actions' ] );

        // Preview emails
        add_filter( 'woocommerce_email_preview_placeholders', [ $this, 'email_preview_placeholders' ], 10, 3 );
    }

    public function yay_wholesale_register_email_classes( $email_classes ) {
        $email_classes['Yay_Wholesale_New_Order_Placed']              = new New_Order_Placed();
        $email_classes['Yay_Wholesale_New_Account_Registered']        = new New_Account_Registered();
        $email_classes['Yay_Wholesale_Account_Registration_Approved'] = new Account_Registration_Approved();
        $email_classes['Yay_Wholesale_Account_Registration_Rejected'] = new Account_Registration_Rejected();
        $email_classes['Yay_Wholesale_Account_Registration_Pending']  = new Account_Registration_Pending();

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
    public function yay_wholesale_register_email_actions( $actions ) {
        $new_actions = array_merge(
            $actions,
            [
                'yhs_new_wholesale_order_placed',
                'yhs_new_account_registered',
                'yhs_account_registration_pending',
                'yhs_account_registration_rejected',
                'yhs_account_registration_approved',

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
