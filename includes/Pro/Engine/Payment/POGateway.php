<?php
namespace YayWholesaleB2B\Pro\Engine\Payment;

use YayWholesaleB2B\Pro\Helpers\POGatewayHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Purchase Order (PO) Gateway — offline gateway, customer supplies a PO number
 * (and optionally a PO document); order is placed on-hold for manual verification.
 */
class POGateway extends \WC_Payment_Gateway {

    public const GATEWAY_ID = 'ywhs_po_gateway';

    public string $instructions;

    public function __construct() {
        $this->id                 = self::GATEWAY_ID;
        $this->has_fields         = true;
        $this->method_title       = __( 'Purchase Order (PO)', 'yay-wholesale-b2b' );
        $this->method_description = __( 'Accept purchase orders from B2B customers. Customers provide a PO number (and optionally attach the PO document); the order is placed on-hold for manual verification.', 'yay-wholesale-b2b' );
        $this->instructions       = '';

        $this->init_form_fields();
        $this->init_settings();

        $this->title        = $this->get_option( 'title' );
        $this->description  = $this->get_option( 'description' );
        $this->instructions = $this->get_option( 'instructions' );
        $this->enabled      = $this->get_option( 'enabled' );

        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, [ $this, 'process_admin_options' ] );
        add_action( 'woocommerce_thankyou_' . $this->id, [ $this, 'thankyou_page' ] );
        add_action( 'woocommerce_email_before_order_table', [ $this, 'email_instructions' ], 10, 3 );
    }

    public function init_form_fields() {
        $this->form_fields = [
            'enabled'            => [
                'title'   => __( 'Enable/Disable', 'yay-wholesale-b2b' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable Purchase Order (PO)', 'yay-wholesale-b2b' ),
                'default' => 'no',
            ],
            'title'              => [
                'title'       => __( 'Title', 'yay-wholesale-b2b' ),
                'type'        => 'text',
                'description' => __( 'Payment method title the customer sees at checkout.', 'yay-wholesale-b2b' ),
                'default'     => __( 'Purchase Order (PO)', 'yay-wholesale-b2b' ),
                'desc_tip'    => true,
            ],
            'description'        => [
                'title'       => __( 'Description', 'yay-wholesale-b2b' ),
                'type'        => 'textarea',
                'description' => __( 'Payment method description the customer sees at checkout.', 'yay-wholesale-b2b' ),
                'default'     => __( 'Pay using your company purchase order. Enter your PO number below to place the order.', 'yay-wholesale-b2b' ),
                'desc_tip'    => true,
            ],
            'instructions'       => [
                'title'       => __( 'Instructions', 'yay-wholesale-b2b' ),
                'type'        => 'textarea',
                'description' => __( 'Shown on the order-received page and in order emails.', 'yay-wholesale-b2b' ),
                'default'     => __( 'We have received your purchase order. Your order is on hold until we verify the PO.', 'yay-wholesale-b2b' ),
                'desc_tip'    => true,
            ],
            'require_attachment' => [
                'title'       => __( 'Require Attachment', 'yay-wholesale-b2b' ),
                'type'        => 'checkbox',
                'label'       => __( 'Require customers to upload a PO document at checkout', 'yay-wholesale-b2b' ),
                'description' => __( 'Accepted files: PDF, JPG, PNG. Max size: 5MB.', 'yay-wholesale-b2b' ),
                'default'     => 'no',
                'desc_tip'    => true,
            ],
        ];
    }

    public function is_attachment_required(): bool {
        return 'yes' === $this->get_option( 'require_attachment' );
    }

    public function payment_fields() {
        if ( $this->description ) {
            echo wp_kses_post( wpautop( $this->description ) );
        }
        ?>
        <fieldset id="ywhs-po-gateway-fields">
            <p class="form-row form-row-wide">
                <label for="ywhs_po_number">
                    <?php esc_html_e( 'PO Number', 'yay-wholesale-b2b' ); ?> <span class="required">*</span>
                </label>
                <input type="text" id="ywhs_po_number" name="ywhs_po_number" autocomplete="off" required="required" />
            </p>
            <?php if ( $this->is_attachment_required() ) : ?>
            <p class="form-row form-row-wide">
                <label for="ywhs_po_attachment">
                    <?php esc_html_e( 'PO Attachment', 'yay-wholesale-b2b' ); ?> <span class="required">*</span>
                </label>
                <input type="file" id="ywhs_po_attachment" name="ywhs_po_attachment" accept=".pdf,.jpg,.jpeg,.png" required="required" />
                <small><?php esc_html_e( 'PDF, JPG or PNG. Max 5MB.', 'yay-wholesale-b2b' ); ?></small>
            </p>
            <?php endif; ?>
        </fieldset>
        <?php
    }

    public function validate_fields() {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the checkout nonce before calling gateway validation.
        $po_number = isset( $_POST['ywhs_po_number'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs_po_number'] ) ) : '';

        if ( '' === trim( $po_number ) ) {
            wc_add_notice( __( 'Please enter your PO number.', 'yay-wholesale-b2b' ), 'error' );
            return false;
        }

        if ( $this->is_attachment_required() ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the checkout nonce before calling gateway validation.
            $file = $_FILES['ywhs_po_attachment'] ?? null;

            if ( ! empty( $file['tmp_name'] ) ) {
                // Classic checkout: file arrives directly in this request.
                $is_valid = POGatewayHelper::validate_file( $file );
                if ( is_wp_error( $is_valid ) ) {
                    wc_add_notice( $is_valid->get_error_message(), 'error' );
                    return false;
                }
            } else {
                // Block checkout: the block already uploaded the file via the REST
                // endpoint and passes back a reference in payment_data.
                // phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the checkout nonce before calling gateway validation.
                $ref = isset( $_POST['ywhs_po_attachment_ref'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs_po_attachment_ref'] ) ) : '';

                if ( '' === $ref || ! POGatewayHelper::resolve_protected_file( $ref ) ) {
                    wc_add_notice( __( 'Please attach your PO document.', 'yay-wholesale-b2b' ), 'error' );
                    return false;
                }
            }
        }

        return true;
    }

    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- validated in validate_fields(), re-checked here for direct API/blocks callers.
        $po_number = isset( $_POST['ywhs_po_number'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs_po_number'] ) ) : '';
        if ( '' === trim( $po_number ) ) {
            wc_add_notice( __( 'Please enter your PO number.', 'yay-wholesale-b2b' ), 'error' );
            return [ 'result' => 'failure' ];
        }

        POGatewayHelper::save_po_number( $order, $po_number );

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- validated in validate_fields(), re-checked here for direct API/blocks callers.
        $file = $_FILES['ywhs_po_attachment'] ?? null;
        if ( $this->is_attachment_required() && ! empty( $file['tmp_name'] ) ) {
            // Classic checkout.
            $uploaded = POGatewayHelper::upload_attachment( $file );
            if ( is_wp_error( $uploaded ) ) {
                wc_add_notice( $uploaded->get_error_message(), 'error' );
                return [ 'result' => 'failure' ];
            }
            POGatewayHelper::save_attachment( $order, $uploaded['path'], $uploaded['filename'] );
        } elseif ( $this->is_attachment_required() ) {
            // Block checkout: file was pre-uploaded via REST, referenced by path.
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- validated in validate_fields(), re-checked here for direct API/blocks callers.
            $ref = isset( $_POST['ywhs_po_attachment_ref'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs_po_attachment_ref'] ) ) : '';
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- validated in validate_fields(), re-checked here for direct API/blocks callers.
            $ref_filename = isset( $_POST['ywhs_po_attachment_name'] ) ? sanitize_file_name( wp_unslash( $_POST['ywhs_po_attachment_name'] ) ) : '';

            if ( '' === $ref || ! POGatewayHelper::resolve_protected_file( $ref ) ) {
                wc_add_notice( __( 'Please attach your PO document.', 'yay-wholesale-b2b' ), 'error' );
                return [ 'result' => 'failure' ];
            }

            POGatewayHelper::save_attachment( $order, $ref, $ref_filename ? $ref_filename : basename( $ref ) );
        }//end if

        $order->update_status( 'on-hold', __( 'Awaiting PO verification.', 'yay-wholesale-b2b' ) );
        wc_reduce_stock_levels( $order_id );

        if ( WC()->cart ) {
            WC()->cart->empty_cart();
        }

        return [
            'result'   => 'success',
            'redirect' => $this->get_return_url( $order ),
        ];
    }

    public function thankyou_page( $order_id ) {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        if ( $this->instructions ) {
            echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
        }

        $po_number = POGatewayHelper::get_po_number( $order );
        if ( $po_number ) {
            echo '<p><strong>' . esc_html__( 'PO Number:', 'yay-wholesale-b2b' ) . '</strong> ' . esc_html( $po_number ) . '</p>';
        }
    }

    /**
     * @param \WC_Order $order
     * @param bool      $sent_to_admin
     * @param bool      $plain_text
     */
    public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
        if ( ! $order instanceof \WC_Order || self::GATEWAY_ID !== $order->get_payment_method() ) {
            return;
        }

        $po_number = POGatewayHelper::get_po_number( $order );
        if ( ! $po_number ) {
            return;
        }

        if ( $plain_text ) {
            echo esc_html__( 'PO Number:', 'yay-wholesale-b2b' ) . ' ' . esc_html( $po_number ) . "\n\n";
        } else {
            echo '<p><strong>' . esc_html__( 'PO Number:', 'yay-wholesale-b2b' ) . '</strong> ' . esc_html( $po_number ) . '</p>';
        }
    }
}
