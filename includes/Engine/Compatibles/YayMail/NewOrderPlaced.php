<?php
namespace Yay_Wholesale_B2B\Engine\Compatibles\YayMail;

use Yay_Wholesale_B2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * New Order Placed Mail Compatible
 */
class NewOrderPlaced extends \YayMail\Abstracts\BaseEmail {
    use SingletonTrait;

    public $email_types = [ YAYMAIL_WITH_ORDER_EMAILS ];

    protected function __construct() {
        $emails = \WC_Emails::instance()->get_emails();
        $email  = $emails['Yay_Wholesale_B2B_New_Order_Placed'];
        if ( ! $email ) {
            return;
        }

        $this->id        = $email->id;
        $this->title     = $email->title;
        $this->recipient = empty( $email->recipient ) ? __( 'Customer', 'yay-wholesale-b2b' ) : __( 'Admin', 'yay-wholesale-b2b' );

        $this->source          = [
            'plugin_id'   => 'yay-wholesale-b2b',
            'plugin_name' => 'YayWholesale',
        ];
        $this->render_priority = apply_filters( 'yaymail_email_render_priority', $this->render_priority, $this->id );
        add_filter( 'wc_get_template', [ $this, 'get_template_file' ], $this->render_priority ?? 10, 3 );
        $this->maybe_disable_block_email_editor();
    }

    public function get_default_elements() {
        $email_title = $this->title;
        // translators: customer name.
        $email_text      = sprintf( esc_html__( 'You’ve received the following order from %s:', 'yay-wholesale-b2b' ), '[yaymail_billing_first_name] [yaymail_billing_last_name]' );
        $additional_text = __( 'Congratulations on the sale.', 'yay-wholesale-b2b' );

        $default_elements = \YayMail\Elements\ElementsLoader::load_elements(
            [
                [
                    'type' => 'Logo',
                ],
                [
                    'type'       => 'Heading',
                    'attributes' => [
                        'rich_text' => $email_title . ': #[yaymail_order_number is_plain="true"]',
                    ],
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<p><span>' . $email_text . '</span></p>',
                    ],
                ],
                [
                    'type' => 'OrderDetails',
                ],
                [
                    'type' => 'BillingShippingAddress',
                ],
                [
                    'type'       => 'Text',
                    'attributes' => [
                        'rich_text' => '<p><span>' . $additional_text . '</span></p>',
                        'padding'   => [
                            'top'    => '0',
                            'right'  => '50',
                            'bottom' => '38',
                            'left'   => '50',
                        ],
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
        return __DIR__ . '/templates/new-order-placed.php';
    }
}
