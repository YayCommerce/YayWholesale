<?php
namespace Yay_Wholesale\Engine\Admin\Emails;

use Yay_Wholesale\Helpers\RequestsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Wholesale New Account Registered Email
 *
 * @method static New_Account_Registered get_instance()
 */
class New_Account_Registered extends Wholesale_Email_Base {

    /**
     * Constructor.
     */
    public function __construct() {

        $this->id             = 'yay_wholesale_new_account_registered';
        $this->customer_email = false;
        $this->title          = __( 'New wholesale account register', 'yay-wholesale' );
        $this->email_group    = 'wholesale_account';
        $this->description    = __( 'Notify when a user registers a wholesale account', 'yay-wholesale' );
        $this->template_html  = 'new-account-registered.php';
        $this->template_plain = 'plain/new-account-registered.php';
        $this->placeholders   = [
            '{account_name}' => '{account_name}',
        ];
        // Trigger the email when a new wholesale account is registered.
        add_action( 'yhs_new_account_registered', [ $this, 'trigger' ], 10, 1 );

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
        return __( '[{site_title}]: New wholesale account registration', 'yay-wholesale' );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'Welcome to Our Wholesale Program!', 'yay-wholesale' );
    }

    /**
     * Get default body content.
     *
     * @return string
     */
    public function get_default_email_content() {
        $content  = sprintf( '%s {account_name}', __( 'Hi', 'yay-wholesale' ) );
        $content .= "\n\n";
        $content .= __( 'Thank you for registering a wholesale account on our store.', 'yay-wholesale' );
        $content .= "\n\n";
        $content .= __( 'We have received your application and our team is currently reviewing your information.', 'yay-wholesale' );
        $content .= "\n\n";
        $content .= sprintf( '<strong>%s</strong>', __( 'What happens next?', 'yay-wholesale' ) );
        $content .= "\n\n";
        $content .= sprintf(
            '<ul>
                <li>%s</li>
                <li>%s</li>
            </ul>',
            __( 'Your account will be reviewed within 24-48 hours.', 'yay-wholesale' ),
            __( 'We will notify you once your wholesale account has been approved or if more information is needed.', 'yay-wholesale' )
        );
        $content .= "\n\n";
        $content .= __( 'Thank you for your interest in partnering with us. We look forward to working with you!', 'yay-wholesale' );
        $content .= "\n\n";

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
            $this->object                         = RequestsHelper::get_request_by_id( $request_id );
            $this->placeholders['{account_name}'] = $this->object['name'];
        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }
}
