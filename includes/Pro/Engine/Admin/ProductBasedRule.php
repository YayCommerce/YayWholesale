<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\ProductPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Product-based Pricing Engine.
 */
class ProductBasedRule {
    use SingletonTrait;

    protected function __construct() {
        // Single product
        add_action( 'woocommerce_product_options_general_product_data', [ $this, 'add_product_based_discount_inputs_single_product' ], 9 );
        add_action( 'woocommerce_process_product_meta', [ $this, 'save_custom_product_based_discount' ] );

        // Variable product
        add_action( 'woocommerce_variation_options_pricing', [ $this, 'add_product_based_discount_inputs_variable_product' ], 9, 3 );
        add_action( 'woocommerce_save_product_variation', [ $this, 'save_custom_vairable_product_based_discount' ], 10, 2 );
    }

    /**
     * Add the UI of mutiple form fields on edit-product page
     */
    public function add_product_based_discount_inputs_single_product() {
        global $product_object;
        $allow_product_types = ProductPricingHelper::get_allowed_product_types_for_display_setting();
        if ( in_array( $product_object->get_type(), $allow_product_types, true ) ) {
            require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/custom-fixed-discounts/simple-product.php';
        }
    }

    /**
     * Add the UI of mutiple form fields on edit-variable-product page
     *
     * @param int                  $index The index of variation.
     * @param array                $variation_data The data of current variation.
     * @param \WC_Product_Variable $variation The current variation.
     */
    public function add_product_based_discount_inputs_variable_product( $index, $variation_data, $variation ) {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/custom-fixed-discounts/variable-product.php';
    }

    /**
     * Handle to save the product-based discount when the product completely is saved
     *
     * @param int $post_id The id of current product (post).
     */
    public function save_custom_product_based_discount( $post_id ) {
        // verifi nonce
        $nonce = isset( $_POST['ywhs-product-based-discount-nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs-product-based-discount-nonce'] ) ) : false;
        if ( ! $nonce && ! wp_verify_nonce( $nonce, 'ywhs-product-based-discount-nonce' ) ) {
            return false;
        }

        if ( empty( $_POST['yay-wholesale-b2b'] ) ) {
            return false;
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $post_data = wp_unslash( $_POST['yay-wholesale-b2b'] );

        $wholesale_roles      = RolesHelper::get_wholesale_roles();
        $custom_discount_data = ProductPricingHelper::handle_product_based_discount_data_from_post( $wholesale_roles, $post_data );
        $custom_access_data   = ProductAccessHelper::handle_product_based_access_restriction_from_post( $wholesale_roles, $post_data );

        if ( ! $custom_discount_data || ! ( isset( $_POST['woocommerce_meta_nonce'], $_POST['acme_text_id'] ) || wp_verify_nonce( sanitize_key( $_POST['woocommerce_meta_nonce'] ), 'woocommerce_save_data' ) ) ) {
            return false;
        }
        $product_type = empty( $_POST['product-type'] ) ? \WC_Product_Factory::get_product_type( $post_id ) : sanitize_title( wp_unslash( $_POST['product-type'] ) );

        do_action( 'ywhs_before_saved_product_based_discount', $custom_discount_data, $post_id, $product_type );

        // Discount
        ProductPricingHelper::save_product_based_discount( $post_id, $custom_discount_data );
        // Access Restriction
        ProductAccessHelper::save_product_based_access_restriction( $post_id, $custom_access_data );

        do_action( 'ywhs_after_saved_product_based_discount', $custom_discount_data, $post_id, $product_type );
    }

    /**
     * Handle to save the variable product-based discount when the product completely is saved
     *
     * @param int $variation_id The id of current variation (post).
     * @param int $index The index of variation.
     */
    public function save_custom_vairable_product_based_discount( $variation_id, $index ) {
        // verifi nonce
        $nonce = isset( $_POST['ywhs-product-based-discount-nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs-product-based-discount-nonce'] ) ) : false;
        if ( ! $nonce && ! wp_verify_nonce( $nonce, 'ywhs-product-based-discount-nonce' ) ) {
            return false;
        }

        if ( empty( $_POST['yay-wholesale-b2b'] ) ) {
            return false;
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $post_data = wp_unslash( $_POST['yay-wholesale-b2b'] );

        check_ajax_referer( 'save-variations', 'security' );
        $wholesale_roles      = RolesHelper::get_wholesale_roles();
        $custom_discount_data = ProductPricingHelper::handle_product_based_discount_data_from_post( $wholesale_roles, $post_data, $index );

        if ( ! $custom_discount_data ) {
            return false;
        }

        do_action( 'ywhs_before_saved_variable_product_based_discount', $custom_discount_data, $variation_id );

        ProductPricingHelper::save_product_based_discount( $variation_id, $custom_discount_data );

        do_action( 'ywhs_after_saved_variable_product_based_discount', $custom_discount_data, $variation_id );
    }
}
