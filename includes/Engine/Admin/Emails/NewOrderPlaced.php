<?php
namespace YayWholesaleB2B\Engine\Admin\Emails;

use WC_Order;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Wholesale New Order Placed Email
 *
 * @method static NewOrderPlaced get_instance()
 */
class NewOrderPlaced extends WholesaleEmailBase {

    public function __construct() {
        $this->id             = 'yaywholesaleb2b_new_order_placed';
        $this->customer_email = false;
        $this->email_group    = 'wholesale_order';
        $this->title          = __( 'New wholesale order is placed', 'yay-wholesale-b2b' );
        $this->description    = __( 'Notify when a new wholesale order is placed', 'yay-wholesale-b2b' );
        $this->template_html  = 'new-order-placed.php';
        $this->template_plain = 'plain/new-order-placed.php';

        $this->placeholders = [
            '{order_details}'    => '{order_details}',
            '{order_meta}'       => '{order_meta}',
            '{customer_details}' => '{customer_details}',
        ];

        // Trigger the email when a new order is placed.
        add_action( 'ywhs_new_wholesale_order_placed', [ $this, 'trigger' ], 10, 2 );

        parent::__construct();

        // Other settings.
        $this->recipient = $this->get_option( 'recipient', get_option( 'admin_email' ) );
    }

    /**
     * Get email subject.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}]: New wholesale order #{order_number} is placed', 'yay-wholesale-b2b' );
    }

    /**
     * Get email heading.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_heading() {
        return __( 'New wholesale order: #{order_number}', 'yay-wholesale-b2b' );
    }

    /**
     * Get default body content.
     *
     * @return string
     */
    public function get_default_email_content() {
        $content  = sprintf( '%s {customer_name}', __( 'You’ve received a new wholesale order from', 'yay-wholesale-b2b' ) );
        $content .= "\n\n";

        $content .= "{order_details}\n\n";
        $content .= "{order_meta}\n\n";
        $content .= "{customer_details}\n\n";

        return $content;
    }

    /**
     * Get default additional content.
     *
     * @since  3.1.0
     * @return string
     */
    public function get_default_additional_content() {
        return __( 'Congratulations on the sale!', 'yay-wholesale-b2b' );
    }

    /**
     * Get content HTML.
     *
     * @return string
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html,
            [
                'order'              => $this->object,
                'email_heading'      => $this->get_heading(),
                'placeholders'       => $this->placeholders,
                'content'            => $this->get_email_content(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => true,
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
                'order'              => $this->object,
                'email_heading'      => $this->get_heading(),
                'placeholders'       => $this->placeholders,
                'content'            => $this->get_email_content(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => false,
                'plain_text'         => true,
                'email'              => $this,
            ]
        );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param int            $order_id The order ID.
     * @param WC_Order|false $order Order object.
     */
    public function trigger( int $order_id, ?WC_Order $order = null ): void {
        $this->setup_locale();

        if ( $order_id && ! is_a( $order, 'WC_Order' ) ) {
            $order = wc_get_order( $order_id );
        }

        if ( is_a( $order, 'WC_Order' ) ) {
            $this->object                          = $order;
            $this->placeholders['{order_date}']    = wc_format_datetime( $this->object->get_date_created() );
            $this->placeholders['{order_number}']  = $this->object->get_order_number();
            $this->placeholders['{customer_name}'] = $this->object->get_formatted_billing_full_name();
            if ( $this->is_enabled() && $this->get_recipient() ) {
                // Wholesale order
                if ( $order->get_meta( '_ywhs_wholesale_role' ) ) {
                        $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
                }
            }
        }

        $this->restore_locale();
    }
}
