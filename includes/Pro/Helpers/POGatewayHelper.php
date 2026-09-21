<?php
namespace YayWholesaleB2B\Pro\Helpers;

defined( 'ABSPATH' ) || exit;

/**
 * PO Gateway Helper — order meta and attachment storage for the Purchase Order gateway.
 */
class POGatewayHelper {

    public const META_PO_NUMBER       = '_ywhs_po_number';
    public const META_ATTACHMENT_PATH = '_ywhs_po_attachment_path';
    public const META_ATTACHMENT_NAME = '_ywhs_po_attachment_name';

    public const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB.

    public const ALLOWED_MIME_TYPES = [
        'pdf'  => 'application/pdf',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
    ];

    /**
     * Subdir under uploads/woocommerce_uploads — WooCommerce protects that folder
     * with a deny-all .htaccess on install, same as downloadable product files.
     */
    public const PROTECTED_SUBDIR = 'woocommerce_uploads/ywhs-po-gateway';

    public static function get_po_number( \WC_Order $order ) {
        return $order->get_meta( self::META_PO_NUMBER );
    }

    public static function save_po_number( \WC_Order $order, string $po_number ) {
        $order->update_meta_data( self::META_PO_NUMBER, sanitize_text_field( $po_number ) );
        $order->save_meta_data();
    }

    public static function has_attachment( \WC_Order $order ): bool {
        return (bool) $order->get_meta( self::META_ATTACHMENT_PATH );
    }

    public static function get_attachment_path( \WC_Order $order ) {
        return $order->get_meta( self::META_ATTACHMENT_PATH );
    }

    public static function get_attachment_filename( \WC_Order $order ) {
        return $order->get_meta( self::META_ATTACHMENT_NAME );
    }

    public static function save_attachment( \WC_Order $order, string $relative_path, string $filename ) {
        $order->update_meta_data( self::META_ATTACHMENT_PATH, $relative_path );
        $order->update_meta_data( self::META_ATTACHMENT_NAME, sanitize_file_name( $filename ) );
        $order->save_meta_data();
    }

    /**
     * Validate an uploaded file ($_FILES-shaped array) against type/size rules.
     * Checks real file content (not just the extension) via wp_check_filetype_and_ext().
     *
     * @param array $file
     * @return true|\WP_Error
     */
    public static function validate_file( array $file ) {
        if ( empty( $file['tmp_name'] ) || ( isset( $file['error'] ) && UPLOAD_ERR_OK !== $file['error'] ) ) {
            return new \WP_Error( 'upload_error', __( 'File upload failed.', 'yay-wholesale-b2b' ) );
        }

        if ( ( $file['size'] ?? 0 ) > self::MAX_FILE_SIZE ) {
            return new \WP_Error( 'file_too_large', __( 'Attachment must be smaller than 5MB.', 'yay-wholesale-b2b' ) );
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';

        $filetype = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], self::ALLOWED_MIME_TYPES );

        if ( empty( $filetype['ext'] ) || empty( $filetype['type'] ) || ! in_array( $filetype['ext'], array_keys( self::ALLOWED_MIME_TYPES ), true ) ) {
            return new \WP_Error( 'invalid_file_type', __( 'Attachment must be a PDF, JPG, or PNG file.', 'yay-wholesale-b2b' ) );
        }

        return true;
    }

    /**
     * Upload a validated file into the protected uploads subfolder.
     *
     * @param array $file $_FILES-shaped array.
     * @return array{path: string, filename: string}|\WP_Error
     */
    public static function upload_attachment( array $file ) {
        $is_valid = self::validate_file( $file );
        if ( is_wp_error( $is_valid ) ) {
            return $is_valid;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';

        add_filter( 'upload_dir', [ __CLASS__, 'filter_upload_dir' ] );
        $result = wp_handle_upload(
            $file,
            [
                'test_form' => false,
                'mimes'     => self::ALLOWED_MIME_TYPES,
            ]
        );
        remove_filter( 'upload_dir', [ __CLASS__, 'filter_upload_dir' ] );

        if ( isset( $result['error'] ) ) {
            return new \WP_Error( 'upload_failed', $result['error'] );
        }

        $upload_dir     = wp_upload_dir();
        $relative_path  = ltrim(
            str_replace( wp_normalize_path( $upload_dir['basedir'] ), '', wp_normalize_path( $result['file'] ) ),
            '/'
        );

        return [
            'path'     => $relative_path,
            'filename' => sanitize_file_name( $file['name'] ),
        ];
    }

    public static function filter_upload_dir( array $dirs ) {
        $dirs['subdir'] = '/' . self::PROTECTED_SUBDIR . $dirs['subdir'];
        $dirs['path']   = $dirs['basedir'] . $dirs['subdir'];
        $dirs['url']    = $dirs['baseurl'] . $dirs['subdir'];
        return $dirs;
    }

    /**
     * Resolve a relative path (as stored on the order, or received from an
     * upload/checkout request) to a real file, confirming it actually lives
     * inside the protected attachment folder (blocks path traversal).
     *
     * @param string $relative_path
     * @return string|false Absolute real path, or false if invalid/not found.
     */
    public static function resolve_protected_file( string $relative_path ) {
        if ( '' === $relative_path ) {
            return false;
        }

        $upload_dir = wp_upload_dir();
        $real_base  = realpath( wp_normalize_path( trailingslashit( $upload_dir['basedir'] ) . self::PROTECTED_SUBDIR ) );
        $real_file  = realpath( wp_normalize_path( trailingslashit( $upload_dir['basedir'] ) . $relative_path ) );

        if ( ! $real_base || ! $real_file || 0 !== strpos( wp_normalize_path( $real_file ), wp_normalize_path( $real_base ) ) ) {
            return false;
        }

        return $real_file;
    }

    public static function get_download_url( int $order_id ): string {
        return add_query_arg(
            [
                'action'   => 'ywhs_po_gateway_download',
                'order_id' => $order_id,
                'nonce'    => wp_create_nonce( 'ywhs_po_gateway_download_' . $order_id ),
            ],
            admin_url( 'admin-ajax.php' )
        );
    }
}
