<?php
namespace Yay_Wholesale\Engine\Admin\Emails;

use Automattic\WooCommerce\Utilities\FeaturesUtil;
use Yay_Wholesale\Helpers\RequestsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Wholesale Account Registration Rejected Email
 *
 * @method static Account_Registration_Rejected get_instance()
 */
class Account_Registration_Rejected extends Wholesale_Email_Base {

    /**
     * Constructor.
     */
    public function __construct() {

        $this->id             = 'yay_wholesale_account_registration_rejected';
        $this->customer_email = true;
        $this->title          = __( 'Wholesale account is rejected', 'yay-wholesale' );
        $this->email_group    = 'wholesale_account';
        $this->description    = __( 'Notify when a wholesale account is rejected', 'yay-wholesale' );
        $this->template_html  = 'account-registration-rejected.php';
        $this->template_plain = 'plain/account-registration-rejected.php';
        $this->placeholders   = [
            '{account_name}' => '{account_name}',
        ];
        // Trigger the email when a new wholesale account is registered.
        add_action( 'yhs_account_registration_rejected', [ $this, 'trigger' ], 10, 1 );

        // Call parent constructor
        parent::__construct();
    }

    /**
     * Get email subject.
     *
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}]: Your wholesale account is rejected', 'yay-wholesale' );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'Your Wholesale Account Application has been Rejected', 'yay-wholesale' );
    }

    /**
     * Get default body content.
     *
     * @return string
     */
    public function get_default_email_content() {
        $content  = sprintf( '%s {account_name}', __( 'Hi', 'yay-wholesale' ) );
        $content .= "\n\n";
        $content .= sprintf( __( 'Thank you for your interest in partnering with %s.', 'yay-wholesale' ), $this->get_blogname() );
        $content .= "\n\n";

        $content .= __( 'After careful review, we regret to inform you that your wholesale account application has not been approved at this time.', 'yay-wholesale' );
        $content .= "\n\n";
        $content .= __( 'If you believe this decision is in error or would like more information, please feel free to contact our support team.', 'yay-wholesale' );
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
            $this->recipient                      = $this->object['email'];
            $this->placeholders['{account_name}'] = $this->object['name'];

        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }
}
