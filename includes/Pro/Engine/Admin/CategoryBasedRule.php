<?php

namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\CategoryPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Category Based Pricing Engine.
 */
class CategoryBasedRule {

    use SingletonTrait;

    protected function __construct() {
        add_action( 'product_cat_add_form_fields', [ $this, 'add_custom_category_field' ], 11 );
        add_action( 'product_cat_edit_form_fields', [ $this, 'edit_custom_category_field' ], 11 );
        add_action( 'edited_product_cat', [ $this, 'save_category_based_discount' ], 10, 2 );
        add_action( 'create_product_cat', [ $this, 'save_category_based_discount' ], 10, 2 );

        // Column
        add_filter( 'manage_edit-product_cat_columns', [ $this, 'add_custom_data_columns_for_cat' ], 10, 1 );
        add_action( 'manage_product_cat_custom_column', [ $this, 'render_custom_data_columns_for_cat' ], 10, 3 );
    }

    /**
     * Add UI for Creating-category page
     */
    public function add_custom_category_field() {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/custom-fixed-discounts/create-category.php';
    }

    /**
     * Add UI for Editing-category page
     *
     * @param \WP_Term $term term object (Category).
     */
    public function edit_custom_category_field( $term ) {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/custom-fixed-discounts/edit-category.php';
    }

    /**
     * Save category-based discount
     *
     * @param mixed $term_id Term ID being saved.
     * @param mixed $taxonomy_id The term taxonomy ID.
     */
    public function save_category_based_discount( $term_id, $taxonomy_id = '' ) {
        // verifi nonce
        $nonce = isset( $_POST['ywhs-category-based-discount-nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['ywhs-category-based-discount-nonce'] ) ) : false;
        if ( ! $nonce && ! wp_verify_nonce( $nonce, 'ywhs-category-based-discount-nonce' ) ) {
            return false;
        }

        if ( empty( $_POST['yay-wholesale-b2b'] ) ) {
            return false;
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $post_data = wp_unslash( $_POST['yay-wholesale-b2b'] );

        $wholesale_roles      = RolesHelper::get_wholesale_roles();
        $custom_discount_data = CategoryPricingHelper::handle_category_based_discount_data_from_post( $wholesale_roles, $post_data );
        $custom_access_data   = CategoryAccessHelper::handle_category_based_access_restriction_from_post( $wholesale_roles, $post_data );

        if ( empty( $custom_discount_data ) ) {
            return false;
        }

        do_action( 'ywhs_before_saved_category_based_discount', $custom_discount_data, $term_id );

        CategoryPricingHelper::save_category_based_discount( $term_id, $custom_discount_data );
        CategoryAccessHelper::save_category_based_access_restriction( $term_id, $custom_access_data );

        do_action( 'ywhs_after_saved_category_based_discount', $custom_discount_data, $term_id );
    }

    public function add_custom_data_columns_for_cat( $columns ) {
        $new_columns = [];

        foreach ( $columns as $key => $value ) {
            $new_columns[ $key ] = $value;

            if ( $key === 'slug' ) {
                $new_columns['discount_rule'] = 'Discount Rule';
                $new_columns['access_rule']   = 'Access Rule';
            }
        }

        return $new_columns;
    }

    public function render_custom_data_columns_for_cat( $content, $column, $term_id ) {
        switch ( $column ) {
            case 'discount_rule':
                $discount_data = CategoryPricingHelper::get_category_based_discount_setting( $term_id );
                ?>
                <div class="ywhs_discount_rule_column">
                    <span class="<?php echo 'default' === $discount_data['discount_rule'] ? 'ywhs_discount_rule_default' : 'ywhs_discount_rule_custom'; ?>">
                        <?php
                        if ( 'default' === $discount_data['discount_rule'] ) {
                            echo esc_attr_e( 'Default', 'yay-wholesale-b2b' );
                        } else {
                            echo esc_attr_e( 'Percentage Discount', 'yay-wholesale-b2b' );
                        }
                        ?>
                    </span>
                </div>
                <?php
                break;
            case 'access_rule':
                $access_data = CategoryAccessHelper::get_category_based_access_restriction( $term_id );
                ?>
                <div class="ywhs_access_rule_column">
                    <div title="<?php echo esc_attr_e( 'Access rule of retailers (B2C)', 'yay-wholesale-b2b' ); ?>">
                        <?php
                        if ( 'visible-all' === $access_data['rule'] || 'enabled' === $access_data['retailers'] ) :
                            ?>
                            <span><?php echo esc_attr_e( 'B2C: ', 'yay-wholesale-b2b' ); ?></span>
                            <span class="ywhs_access_rule_visible"><?php echo esc_attr_e( 'Yes', 'yay-wholesale-b2b' ); ?></span>
                        <?php else : ?>
                            <span><?php echo esc_attr_e( 'b2c: ', 'yay-wholesale-b2b' ); ?></span>
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
