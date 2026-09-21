<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Pro\Engine\Payment\POGateway;
use YayWholesaleB2B\Pro\Engine\Payment\POGatewayBlocksIntegration;
use YayWholesaleB2B\Pro\Helpers\POGatewayHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * PO Gateway — registration + order detail admin box + protected attachment download.
 */
class POGatewayAdmin {
    use SingletonTrait;

    protected function __construct() {
        add_filter( 'woocommerce_payment_gateways', [ $this, 'register_gateway' ] );
        add_action( 'woocommerce_blocks_payment_method_type_registration', [ $this, 'register_blocks_integration' ] );

        add_action( 'woocommerce_admin_order_data_after_billing_address', [ $this, 'render_order_data' ] );
        add_action( 'woocommerce_process_shop_order_meta', [ $this, 'save_order_data' ] );

        add_action( 'wp_ajax_ywhs_po_gateway_download', [ $this, 'handle_download' ] );
    }

    public function register_gateway( array $gateways ) {
        $gateways[] = POGateway::class;
        return $gateways;
    }

    /**
     * @param \Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $registry
     */
    public function register_blocks_integration( $registry ) {
        $registry->register( new POGatewayBlocksIntegration() );
    }

    /**
     * @param \WC_Order $order
     */
    public function render_order_data( $order ) {
        if ( ! $order instanceof \WC_Order || POGateway::GATEWAY_ID !== $order->get_payment_method() ) {
            return;
        }

        $po_number      = POGatewayHelper::get_po_number( $order );
        $has_attachment = POGatewayHelper::has_attachment( $order );
        $filename       = POGatewayHelper::get_attachment_filename( $order );

        wp_nonce_field( 'ywhs_po_gateway_save_' . $order->get_id(), 'ywhs_po_gateway_nonce' );
        ?>
        <div class="ywhs-po-gateway-order-data">
            <h3><?php esc_html_e( 'Purchase Order', 'yay-wholesale-b2b' ); ?></h3>
            <p class="form-field form-field-wide">
                <label for="ywhs_po_number_admin"><?php esc_html_e( 'PO Number', 'yay-wholesale-b2b' ); ?></label>
                <input type="text" class="short" id="ywhs_po_number_admin" name="ywhs_po_number_admin" value="<?php echo esc_attr( $po_number ); ?>" />
            </p>
            <?php if ( $has_attachment ) : ?>
            <p class="form-field form-field-wide">
                <label><?php esc_html_e( 'Attachment', 'yay-wholesale-b2b' ); ?></label>
                <a href="<?php echo esc_url( POGatewayHelper::get_download_url( $order->get_id() ) ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html( $filename ? $filename : __( 'Download attachment', 'yay-wholesale-b2b' ) ); ?>
                </a>
            </p>
            <?php endif; ?>
        </div>
        <?php
    }

    public function save_order_data( $order_id ) {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified explicitly below.
        $nonce = isset( $_POST['ywhs_po_gateway_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs_po_gateway_nonce'] ) ) : '';

        if ( ! wp_verify_nonce( $nonce, 'ywhs_po_gateway_save_' . $order_id ) ) {
            return;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified above.
        if ( ! isset( $_POST['ywhs_po_number_admin'] ) ) {
            return;
        }

        $order = wc_get_order( $order_id );
        if ( ! $order || POGateway::GATEWAY_ID !== $order->get_payment_method() ) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified above.
        POGatewayHelper::save_po_number( $order, sanitize_text_field( wp_unslash( $_POST['ywhs_po_number_admin'] ) ) );
    }

    /**
     * Stream a PO attachment to an authorized admin. Files live in a folder
     * WooCommerce protects with a deny-all .htaccess, so this handler is the
     * only route to them — never a public/guessable URL.
     */
    public function handle_download() {
        $order_id = isset( $_GET['order_id'] ) ? absint( $_GET['order_id'] ) : 0;
        $nonce    = isset( $_GET['nonce'] ) ? sanitize_text_field( wp_unslash( $_GET['nonce'] ) ) : '';

        if ( ! $order_id || ! wp_verify_nonce( $nonce, 'ywhs_po_gateway_download_' . $order_id ) ) {
            wp_die( esc_html__( 'Invalid request.', 'yay-wholesale-b2b' ), '', [ 'response' => 400 ] );
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You are not allowed to access this file.', 'yay-wholesale-b2b' ), '', [ 'response' => 403 ] );
        }

        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            wp_die( esc_html__( 'Order not found.', 'yay-wholesale-b2b' ), '', [ 'response' => 404 ] );
        }

        $relative_path = POGatewayHelper::get_attachment_path( $order );
        if ( empty( $relative_path ) ) {
            wp_die( esc_html__( 'No attachment found.', 'yay-wholesale-b2b' ), '', [ 'response' => 404 ] );
        }

        $real_file = POGatewayHelper::resolve_protected_file( $relative_path );
        if ( ! $real_file ) {
            wp_die( esc_html__( 'File not found.', 'yay-wholesale-b2b' ), '', [ 'response' => 404 ] );
        }

        $filename = POGatewayHelper::get_attachment_filename( $order );
        $filename = $filename ? $filename : basename( $real_file );

        nocache_headers();
        header( 'Content-Description: File Transfer' );
        header( 'Content-Type: application/octet-stream' );
        header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $filename ) . '"' );
        header( 'Content-Length: ' . filesize( $real_file ) );
        readfile( $real_file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_readfile -- streaming a protected upload, not a remote request.
        exit;
    }
}
