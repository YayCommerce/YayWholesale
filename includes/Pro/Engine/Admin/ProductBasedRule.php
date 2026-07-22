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

        // Column
        add_filter( 'manage_edit-product_columns', [ $this, 'add_custom_data_columns_for_product' ], 10, 1 );
        add_action( 'manage_product_posts_custom_column', [ $this, 'render_custom_data_columns_for_product' ], 10, 2 );
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
        $custom_discount_data = ProductPricingHelper::handle_product_based_discount_data_from_post( $post_id, $wholesale_roles, $post_data );
        $custom_access_data   = ProductAccessHelper::handle_product_based_access_restriction_from_post( $wholesale_roles, $post_data );

        if ( ! $custom_discount_data || ! ( isset( $_POST['woocommerce_meta_nonce'], $_POST['acme_text_id'] ) || wp_verify_nonce( sanitize_key( $_POST['woocommerce_meta_nonce'] ), 'woocommerce_save_data' ) ) ) {
            return false;
        }
        $product_type = empty( $_POST['product-type'] ) ? \WC_Product_Factory::get_product_type( $post_id ) : sanitize_title( wp_unslash( $_POST['product-type'] ) );

        do_action( 'ywhs_before_saved_product_based_discount', $custom_discount_data, $post_id, $product_type );

        // Discount
        ProductPricingHelper::save_product_based_discount_setting( $post_id, $custom_discount_data );
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
        $custom_discount_data = ProductPricingHelper::handle_product_based_discount_data_from_post( $variation_id, $wholesale_roles, $post_data, $index );
        $custom_access_data   = ProductAccessHelper::handle_product_based_access_restriction_from_post( $wholesale_roles, $post_data, $index );

        if ( ! $custom_discount_data ) {
            return false;
        }

        do_action( 'ywhs_before_saved_variable_product_based_discount', $custom_discount_data, $variation_id );

        ProductPricingHelper::save_product_based_discount_setting( $variation_id, $custom_discount_data );
        ProductAccessHelper::save_product_based_access_restriction( $variation_id, $custom_access_data );

        do_action( 'ywhs_after_saved_variable_product_based_discount', $custom_discount_data, $variation_id );
    }

    public function add_custom_data_columns_for_product( $columns ) {
        $new_columns = [];

        foreach ( $columns as $key => $value ) {
            $new_columns[ $key ] = $value;

            // after 'price' column
            if ( $key === 'price' ) {
                $new_columns['discount_rule'] = 'Discount Rule';
                $new_columns['access_rule']   = 'Access Rule';
            }
        }

        return $new_columns;
    }

    public function render_custom_data_columns_for_product( $column, $product_id ) {
        $product             = wc_get_product( $product_id );
        $allow_product_types = ProductPricingHelper::get_allowed_product_types_for_display_setting();
        $is_allowed_product  = in_array( $product->get_type(), $allow_product_types, true );
        switch ( $column ) {
            case 'discount_rule':
                if ( ! $is_allowed_product ) {
                    echo '–';
                    return;
                }
                $discount_data = ProductPricingHelper::get_product_based_discount_setting( $product_id );
                ?>
                <div class="ywhs_discount_rule_column">
                    <span class="<?php echo 'default' === $discount_data['discount_rule'] ? 'ywhs_discount_rule_default' : 'ywhs_discount_rule_custom'; ?>">
                        <?php
                        if ( 'default' === $discount_data['discount_rule'] ) {
                            echo esc_attr_e( 'Default', 'yay-wholesale-b2b' );
                        } elseif ( 'by_role' === $discount_data['discount_type'] ) {
                            echo esc_attr_e( 'Percentage / Fixed amount', 'yay-wholesale-b2b' );
                        } else {
                            echo esc_attr_e( 'Tiered Pricing', 'yay-wholesale-b2b' );
                        }
                        ?>
                    </span>
                    <div>
                    <?php
                break;
            case 'access_rule':
                if ( ! $is_allowed_product ) {
                    echo '–';
                    return;
                }
                $access_data = ProductAccessHelper::get_product_based_access_restriction( $product_id );
                ?>
                        <div class="ywhs_access_rule_column">
                            <div title="<?php echo esc_attr_e( 'Access rule of retailers (B2C)', 'yay-wholesale-b2b' ); ?>">
                            <?php
                            if ( 'visible-all' === $access_data['rule'] || 'enabled' === $access_data['retailers'] ) :
                                ?>
                                    <span><?php echo esc_attr_e( 'B2C: ', 'yay-wholesale-b2b' ); ?></span>
                                    <span class="ywhs_access_rule_visible"><?php echo esc_attr_e( 'Yes', 'yay-wholesale-b2b' ); ?></span>
                                <?php else : ?>
                                    <span><?php echo esc_attr_e( 'B2C: ', 'yay-wholesale-b2b' ); ?></span>
                                    <span class="ywhs_access_rule_hidden"><?php echo esc_attr_e( 'No', 'yay-wholesale-b2b' ); ?></span>
                                <?php endif ?>
                            </div>
                            <div title="<?php echo esc_attr_e( 'Access rule of wholesalers (B2B)', 'yay-wholesale-b2b' ); ?>">
                                <?php
                                if ( 'visible-all' === $access_data['rule'] || 'enabled' === $access_data['wholesalers'] ) :
                                    ?>
                                    <span><?php echo esc_attr_e( 'B2B: ', 'yay-wholesale-b2b' ); ?></span>
                                    <span class="ywhs_access_rule_visible"><?php echo esc_attr_e( 'All', 'yay-wholesale-b2b' ); ?></span>
                                <?php elseif ( 'enabled-selected-roles' === $access_data['wholesalers'] ) : ?>
                                    <span><?php echo esc_attr_e( 'B2B: ', 'yay-wholesale-b2b' ); ?></span>
                                    <span class="ywhs_access_rule_mixed">
                                        <?php
                                        $roles = RolesHelper::get_wholesale_roles();
                                        // Translators: %1$d: The selected roles count, %2$d: All roles count
                                        echo ( esc_html( sprintf( '%1$d / %2$d', count( $access_data['selected_roles'] ), count( $roles ) ) ) );
                                        ?>
                                    </span>
                                <?php else : ?>
                                    <span><?php echo esc_attr_e( 'B2B: ', 'yay-wholesale-b2b' ); ?></span>
                                    <span class="ywhs_access_rule_hidden"><?php echo esc_attr_e( 'None', 'yay-wholesale-b2b' ); ?></span>
                                <?php endif ?>
                            </div>
                        </div>
                <?php
                break;
        }//end switch
    }
}
