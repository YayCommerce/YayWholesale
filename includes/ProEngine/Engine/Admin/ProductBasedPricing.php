<?php
namespace YayWholesaleB2B\ProEngine\Engine\Admin;

use Override;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\ProEngine\Helpers\PricingHelpers\ProductPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Product-based Pricing Engine.
 */
class ProductBasedPricing {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'woocommerce_product_options_general_product_data', [ $this, 'add_product_based_discount_inputs_single_product' ], 9 );
        add_action( 'woocommerce_process_product_meta', [ $this, 'save_custom_product_based_discount' ] );
    }

    /**
     * Add the UI of mutiple form fields on edit-product page
     */
    public function add_product_based_discount_inputs_single_product() {
        global $product_object;
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/ProEngine/Templates/custom-fixed-discounts/simple-product.php';
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

        $wholesale_roles      = RolesHelper::get_wholesale_roles();
        $custom_discount_data = ProductPricingHelper::handle_product_based_discount_data_from_post( $wholesale_roles, $_POST );

        if ( ! $custom_discount_data || ! ( isset( $_POST['woocommerce_meta_nonce'], $_POST['acme_text_id'] ) || wp_verify_nonce( sanitize_key( $_POST['woocommerce_meta_nonce'] ), 'woocommerce_save_data' ) ) ) {
            return false;
        }
        $product_type = empty( $_POST['product-type'] ) ? \WC_Product_Factory::get_product_type( $post_id ) : sanitize_title( wp_unslash( $_POST['product-type'] ) );

        do_action( 'ywhs_before_saved_product_based_discount', $custom_discount_data, $post_id, $product_type );

        update_post_meta( $post_id, 'yaywholesaleb2b_product_based_discount', $custom_discount_data );

        do_action( 'ywhs_after_saved_product_based_discount', $custom_discount_data, $post_id, $product_type );
    }
}
