<?php
namespace Yay_Wholesale_B2B\Engine\Compatibles\YayMail;

use Yay_Wholesale_B2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Account Registration Approved Mail Compatible
 */
class AccountRegistrationApproved extends \YayMail\Abstracts\BaseEmail {
    use SingletonTrait;

    public $email_types = [ YAYMAIL_NON_ORDER_EMAILS ];

    protected function __construct() {
        $emails = \WC_Emails::instance()->get_emails();
        $email  = $emails['Yay_Wholesale_B2B_Account_Registration_Approved'];
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
        $shorcode_function         = \YayMail\Shortcodes\NewUsersShortcodes::get_instance();
        $request_shorcode_function = RequestShortcode::get_instance();

        $shortcodes = array_merge(
            $this->shortcodes,
            $shorcode_function->get_shortcodes(),
            $request_shorcode_function->get_shortcodes()
        );

        return $shortcodes;
    }

    public function get_default_elements() {
        $email_title = $this->title;
        // translators: customer name.
        $email_hi   = sprintf( esc_html__( 'Hi %s,', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_author_name]' );
        $email_text = __( 'Thanks for registering for the wholesale store. Your account has now been approved and you can login as follows:', 'yay-wholesale-b2b' );
        // translators: customer's username.
        $email_text_1      = sprintf( esc_html__( 'Username: %s', 'yay-wholesale-b2b' ), '[yaymail_customer_username]' );
        $email_end         = __( 'We look forward to seeing you soon.', 'yay-wholesale-b2b' );
        $password_generate = '[yaymail_set_password_link text_link="%text_link%"]';
        $password_generate = str_replace( '%text_link%', __( 'Click here to set your password.', 'yay-wholesale-b2b' ), $password_generate );

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
                        'rich_text' => '<p><span>' . $email_hi . '<br><br>' . $email_text . '</span></p>',
                    ],
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<p><span>' . $email_text_1 . '<br><br><span>' . $password_generate . '</span></span></p>',
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
        return __DIR__ . '/templates/account-registration-approved.php';
    }
}
