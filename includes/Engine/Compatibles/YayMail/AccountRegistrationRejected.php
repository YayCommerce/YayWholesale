<?php
namespace Yay_Wholesale\Engine\Compatibles\YayMail;

use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Account Registration Rejected Mail Compatible
 */
class AccountRegistrationRejected extends \YayMail\Abstracts\BaseEmail {
    use SingletonTrait;

    public $email_types = [ YAYMAIL_NON_ORDER_EMAILS ];

    protected function __construct() {
        $emails = \WC_Emails::instance()->get_emails();
        $email  = $emails['Yay_Wholesale_Account_Registration_Rejected'];
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
        $email_hi = sprintf( esc_html__( 'Hi %s,', 'yay-wholesale-b2b' ), '[ywhs_reqeust_author_name]' );
        // translators: %1$s: site name, %2$s: customer username, %3$s: account url .
        $email_text   = sprintf( esc_html__( 'Thank you for your interest in partnering with %s.', 'yay-wholesale-b2b' ), '[yaymail_site_name]' );
        $email_text_1 = __( 'After careful review, we regret to inform you that your wholesale account application has not been approved at this time.', 'yay-wholesale-b2b' );
        $email_text_2 = __( 'If you believe this decision is in error or would like more information, please feel free to contact our support team.', 'yay-wholesale-b2b' );
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
                        'rich_text' => '<p><span>' . $email_hi . '<br><br>' . $email_text . '<br><br>' . $email_text_1 . '<br><br>' . $email_text_2 . '</span></p>',
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
        return __DIR__ . '/templates/account-registration-rejected.php';
    }
}
