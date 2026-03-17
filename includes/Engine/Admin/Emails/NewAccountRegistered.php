<?php
namespace YayWholesaleB2B\Engine\Admin\Emails;

use YayWholesaleB2B\Helpers\RequestsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Wholesale New Account Registered Email
 *
 * @method static NewAccountRegistered get_instance()
 */
class NewAccountRegistered extends WholesaleEmailBase {

    /**
     * Constructor.
     */
    public function __construct() {

        $this->id             = 'yaywholesaleb2b_new_account_registered';
        $this->customer_email = false;
        $this->title          = __( 'New wholesale account register', 'yay-wholesale-b2b' );
        $this->email_group    = 'wholesale_account';
        $this->description    = __( 'Notify when a user registers a wholesale account', 'yay-wholesale-b2b' );
        $this->template_html  = 'new-account-registered.php';
        $this->template_plain = 'plain/new-account-registered.php';

        $admin_email = get_option( 'admin_email' );
        $admin_user  = get_user_by( 'email', $admin_email );

        $this->placeholders = [
            '{account_name}'              => '{account_name}',
            '{admin_name}'                => $admin_user && ! empty( $admin_user->display_name ) ? $admin_user->display_name : __( 'Admin', 'yay-wholesale-b2b' ),
            '{account_email}'             => 'johndoe@email.com',
            '{account_registration_time}' => wp_date(
                get_option( 'date_format' ) . ' ' . get_option( 'time_format' )
            ),
            '{admin_url}'                 => admin_url( 'admin.php?page=yay_wholesale#/request/' ),
        ];
        // Trigger the email when a new wholesale account is registered.
        add_action( 'ywhs_new_account_registered', [ $this, 'trigger' ], 10, 1 );

        // Call parent constructor
        parent::__construct();

        // Other settings.
        $this->recipient = $this->get_option( 'recipient', get_option( 'admin_email' ) );
    }

    /**
     * Get email subject.
     *
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}]: New wholesale account registration', 'yay-wholesale-b2b' );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'A New Wholesale Account Registered!', 'yay-wholesale-b2b' );
    }

    /**
     * Get default body content.
     *
     * @return string
     */
    public function get_default_email_content() {
        $content  = sprintf( '%s {admin_name}', __( 'Hi', 'yay-wholesale-b2b' ) );
        $content .= "\n\n";
        $content .= __( 'This is to inform you that a new wholesale account registration has just been submitted on the website.', 'yay-wholesale-b2b' );
        $content .= "\n\n";
        $content .= __( 'The customer has successfully completed the wholesale registration form, and their information is now pending review and approval.', 'yay-wholesale-b2b' );
        $content .= "\n\n";
        $content .= sprintf( '<strong>%s</strong>', __( 'Registration details:', 'yay-wholesale-b2b' ) );
        $content .= "\n\n";
        $content .= sprintf(
            '<ul>
                <li>%s</li>
                <li>%s</li>
                <li>%s</li>
            </ul>',
            __( 'Customer name: {account_name}', 'yay-wholesale-b2b' ),
            __( 'Email address: {account_email}', 'yay-wholesale-b2b' ),
            __( 'Registration time: {account_registration_time}', 'yay-wholesale-b2b' )
        );
        $content .= "\n\n";
        $content .= __( 'Please log in to the <a href="{admin_url}">admin</a> to review the submitted information and take the necessary action (approve or reject the wholesale request).', 'yay-wholesale-b2b' );
        $content .= "\n\n";

        return $content;
    }

    /**
     * Get default additional content.
     *
     * @return string
     */
    public function get_default_additional_content() {
        return __( 'Thank you for your attention and timely support.', 'yay-wholesale-b2b' );
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
                'blogname'           => $this->get_blogname(),
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
                'blogname'           => $this->get_blogname(),
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
            $this->object                                      = RequestsHelper::get_request_by_id( $request_id );
            $date_string                                       = get_the_date(
                get_option( 'date_format' ) . ' ' . get_option( 'time_format' ),
                $this->object['id']
            );
            $this->placeholders['{account_name}']              = $this->object['name'];
            $this->placeholders['{account_email}']             = $this->object['email'];
            $this->placeholders['{account_registration_time}'] = $date_string;
            $this->placeholders['{admin_url}']                 = admin_url( 'admin.php?page=yay_wholesale#/request/edit/' . $this->object['id'] . '/' );
        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }
}
