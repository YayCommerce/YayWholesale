<?php
namespace Yay_Wholesale\Engine\Admin\Emails;

use Yay_Wholesale\Helpers\RequestsHelper;
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Wholesale Account Registration Approved Email
 *
 * @method static AccountRegistrationApproved get_instance()
 */
class AccountRegistrationApproved extends WholesaleEmailBase {
    /**
     * User login name.
     *
     * @var string
     */
    public $user_login;

    /**
     * Magic link to set initial password.
     *
     * @var string
     */
    public $set_password_url;
    /**
     * Constructor.
     */
    public function __construct() {

        $this->id             = 'yay_wholesale_account_registration_approved';
        $this->customer_email = true;
        $this->title          = __( 'Wholesale account is approved', 'yay-wholesale' );
        $this->email_group    = 'wholesale_account';
        $this->description    = __( 'Notify when a wholesale account is approved', 'yay-wholesale' );
        $this->template_html  = 'account-registration-approved.php';
        $this->template_plain = 'plain/account-registration-approved.php';

        $this->placeholders = [
            '{account_name}'     => '{account_name}',
            '{user_login}'       => '{user_login}',
            '{set_password_url}' => '{set_password_url}',
        ];
        // Trigger the email when a new wholesale account is registered.
        add_action( 'ywhs_account_registration_approved', [ $this, 'trigger' ], 10, 1 );

        // Call parent constructor
        parent::__construct();
    }

    /**
     * Get email subject.
     *
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}]: Your wholesale account is approved', 'yay-wholesale' );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'Your Wholesale Account Application has been Approved', 'yay-wholesale' );
    }

    /**
     * Get default body content.
     *
     * @return string
     */
    public function get_default_email_content() {
        $content  = sprintf( '%s {account_name}', __( 'Hi', 'yay-wholesale' ) );
        $content .= "\n\n";
        $content .= __( 'Thanks for registering for the wholesale store. Your account has now been approved and you can login as follows:', 'yay-wholesale' );
        $content .= "\n\n";
        $content .= sprintf( '%s {user_login}', __( 'Username:', 'yay-wholesale' ) );
        $content .= "\n\n";
        $content .= sprintf( '<a href="{set_password_url}">%s</a>', __( 'Click here to set your password.', 'yay-wholesale' ) );

        return $content;
    }

    /**
     * Get default additional content.
     *
     * @return string
     */
    public function get_default_additional_content() {
        return __( 'We look forward to seeing you soon.', 'yay-wholesale' );
    }

    /**
     * Get content html.
     *
     * @return string
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html,
            [
                'email_heading'      => $this->get_heading(),
                'content'            => $this->get_email_content(),
                'additional_content' => $this->get_additional_content(),
                'placeholders'       => $this->placeholders,
                'user_login'         => $this->user_login,
                'blogname'           => $this->get_blogname(),
                'set_password_url'   => $this->set_password_url,
                'sent_to_admin'      => false,
                'plain_text'         => false,
                'email'              => $this,

            ]
        );
    }

    /**
     * Get content plain.
     *
     * @return string
     */
    public function get_content_plain() {
        return wc_get_template_html(
            $this->template_plain,
            [
                'email_heading'      => $this->get_heading(),
                'content'            => $this->get_email_content(),
                'additional_content' => $this->get_additional_content(),
                'placeholders'       => $this->placeholders,
                'user_login'         => $this->user_login,
                'blogname'           => $this->get_blogname(),
                'set_password_url'   => $this->set_password_url,
                'sent_to_admin'      => false,
                'plain_text'         => true,
                'email'              => $this,
            ]
        );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int $request_id The request ID.
     */
    public function trigger( int $request_id ): void {
        $this->setup_locale();

        if ( $request_id ) {
            $this->object     = RequestsHelper::get_request_by_id( $request_id );
            $account_email    = $this->object['email'];
            $set_password_url = $this->generate_set_password_url();
            $this->recipient  = $account_email;

            $this->placeholders['{account_name}']     = $this->object['name'];
            $this->placeholders['{user_login}']       = $account_email;
            $this->placeholders['{set_password_url}'] = $set_password_url;
            $this->user_login                         = $account_email;
            $this->set_password_url                   = $set_password_url;
        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }

    protected function generate_set_password_url() {
        // Generate a magic link so user can set initial password.
        $key = get_password_reset_key( $this->object );

        if ( is_wp_error( $key ) ) {
            // Something went wrong while getting the key for new password URL, send customer to the generic password reset.
            return wc_get_account_endpoint_url( 'lost-password' );
        }

        return sprintf( '%s?action=newaccount&key=%s&login=%s', wc_get_account_endpoint_url( 'lost-password' ), $key, rawurlencode( $this->user_login ) );
    }
}
