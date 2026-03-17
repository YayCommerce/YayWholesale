<?php
namespace YayWholesaleB2B\Engine\Compatibles\YayMail;

use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * New Account Registered Mail Compatible
 */
class NewAccountRegistered extends \YayMail\Abstracts\BaseEmail {
    use SingletonTrait;

    public $email_types = [ YAYMAIL_NON_ORDER_EMAILS ];

    protected function __construct() {
        $emails = \WC_Emails::instance()->get_emails();
        $email  = $emails['YayWholesaleB2B_New_Account_Registered'];
        if ( ! $email ) {
            return;
        }

        $this->id        = $email->id;
        $this->title     = $email->title;
        $this->recipient = empty( $email->recipient ) ? __( 'Customer', 'yay-wholesale-b2b' ) : __( 'Admin', 'yay-wholesale-b2b' );

        $this->source = [
            'plugin_id'   => 'yay-wholesale-b2b',
            'plugin_name' => 'YayWholesale',
        ];

        $this->render_priority = apply_filters( 'yaymail_email_render_priority', $this->render_priority, $this->id );
        add_filter( 'wc_get_template', [ $this, 'get_template_file' ], $this->render_priority ?? 10, 3 );
        $this->maybe_disable_block_email_editor();
    }

    public function add_shortcodes_to_email( $email ) {
        $email->register_shortcodes( $this->get_shortcodes() );
    }

    public function get_shortcodes() {
        $shorcode_function = RequestShortcode::get_instance();

        $shortcodes = array_merge( $this->shortcodes, $shorcode_function->get_shortcodes() );

        return $shortcodes;
    }

    public function get_default_elements() {
        $email_title = $this->title;
        // translators: admin name.
        $email_hi     = sprintf( esc_html__( 'Hi %s,', 'yay-wholesale-b2b' ), '[yaymail_wholesale_admin_name]' );
        $email_text   = __( 'This is to inform you that a new wholesale account registration has just been submitted on the website.', 'yay-wholesale-b2b' );
        $email_text_1 = __( 'The customer has successfully completed the wholesale registration form, and their information is now pending review and approval.', 'yay-wholesale-b2b' );
        $email_text_2 = __( 'Registration details:', 'yay-wholesale-b2b' );
        // translators: customer name.
        $email_text_3 = sprintf( esc_html__( 'Customer name: %s', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_author_name]' );
        // translators: customer email.
        $email_text_4 = sprintf( esc_html__( 'Email Address: %s', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_author_email]' );
        // translators: customer request registration time.
        $email_text_5 = sprintf( esc_html__( 'Registration time: %s', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_create_time]' );
        // translators: admin url.
        $email_text_6 = sprintf( __( 'Please log in to the <a href="%s">admin</a> to review the submitted information and take the necessary action (approve or reject the wholesale request).', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_admin_url]' );
        $email_end    = __( 'Thank you for your attention and timely support.', 'yay-wholesale-b2b' );

        $default_elements = \YayMail\Elements\ElementsLoader::load_elements(
            [
                [
                    'type' => 'Logo',
                ],
                [
                    'type'       => 'Heading',
                    'attributes' => [
                        'rich_text' => '<p style="font-size:14px;">[yaymail_site_name]</p><div style="font-size: 24px;">' . $email_title . '</div>',
                    ],
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<p><span>' . $email_hi . '<br><br>' . $email_text . '<br><br>' . $email_text_1 . '</span></p>',
                    ],
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<strong>' . $email_text_2 . '</strong><br/><ul><li>' . $email_text_3 . '</li><li>' . $email_text_4 . '</li><li>' . $email_text_5 . '</li></ul><p><span>' . $email_text_6 . '</span></p>',
                    ],
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<p><span>' . $email_end . '</span></p>',
                    ],
                ],

                [
                    'type' => 'Footer',
                ],
            ]
        );

        return $default_elements;
    }

    public function get_template_path() {
        return __DIR__ . '/templates/new-account-registered.php';
    }
}
