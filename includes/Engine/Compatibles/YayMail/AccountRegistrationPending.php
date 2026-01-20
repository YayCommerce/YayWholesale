<?php
namespace Yay_Wholesale_B2B\Engine\Compatibles\YayMail;

use Yay_Wholesale_B2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Account Registration Pending Mail Compatible
 */
class AccountRegistrationPending extends \YayMail\Abstracts\BaseEmail {
    use SingletonTrait;

    public $email_types  = [ YAYMAIL_NON_ORDER_EMAILS ];
    public $request_name = '';

    protected function __construct() {
        $emails = \WC_Emails::instance()->get_emails();
        $email  = $emails['Yay_Wholesale_B2B_Account_Registration_Pending'];
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
        // translators: customer name.
        $email_hi = sprintf( esc_html__( 'Hi %s,', 'yay-wholesale-b2b' ), '[yaymail_wholesale_request_author_name]' );
        // translators: %1$s: site name, %2$s: customer username, %3$s: account url .
        $email_text   = __( 'Thank you for registering a wholesale account on our store.', 'yay-wholesale-b2b' );
        $email_text_1 = __( 'We have received your application and our team is currently reviewing your information.', 'yay-wholesale-b2b' );
        $email_text_2 = __( 'What happens next?', 'yay-wholesale-b2b' );
        $email_text_3 = __( 'Your account will be reviewed within 24-48 hours.', 'yay-wholesale-b2b' );
        $email_text_4 = __( 'We will notify you once your wholesale account has been approved or if more information is needed.', 'yay-wholesale-b2b' );
        $email_text_5 = __( 'Thank you for your interest in partnering with us. We look forward to working with you!', 'yay-wholesale-b2b' );
        $email_end    = __( 'We look forward to seeing you soon.', 'yay-wholesale-b2b' );

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
                        'rich_text' => '<strong>' . $email_text_2 . '</strong><br/><ul><li>' . $email_text_3 . '</li><li>' . $email_text_4 . '</li></ul><p><span>' . $email_text_5 . '</span></p>',
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
        return __DIR__ . '/templates/account-registration-pending.php';
    }
}
