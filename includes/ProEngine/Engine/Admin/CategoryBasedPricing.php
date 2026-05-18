<?php

namespace YayWholesaleB2B\ProEngine\Engine\Admin;

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\ProEngine\Helpers\PricingHelpers\CategoryPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Category Based Pricing Engine.
 */
class CategoryBasedPricing {

    use SingletonTrait;

    protected function __construct() {
        add_action( 'product_cat_add_form_fields', [ $this, 'add_custom_category_field' ], 11 );
        add_action( 'product_cat_edit_form_fields', [ $this, 'edit_custom_category_field' ], 11 );
        add_action( 'edited_product_cat', [ $this, 'save_category_based_discount' ], 10, 2 );
        add_action( 'create_product_cat', [ $this, 'save_category_based_discount' ], 10, 2 );
    }

    /**
     * Add UI for Creating-category page
     */
    public function add_custom_category_field() {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/ProEngine/Templates/custom-fixed-discounts/create-category.php';
    }

    /**
     * Add UI for Editing-category page
     *
     * @param \WP_Term $term term object (Category).
     */
    public function edit_custom_category_field( $term ) {
        require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/ProEngine/Templates/custom-fixed-discounts/edit-category.php';
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

        $wholesale_roles      = RolesHelper::get_wholesale_roles();
        $custom_discount_data = CategoryPricingHelper::handle_category_based_discount_data_from_post( $wholesale_roles, $_POST );

        if ( empty( $custom_discount_data ) ) {
            return false;
        }

        do_action( 'ywhs_before_saved_category_based_discount', $custom_discount_data, $term_id );

        CategoryPricingHelper::save_category_based_discount( $term_id, $custom_discount_data );

        do_action( 'ywhs_after_saved_category_based_discount', $custom_discount_data, $term_id );
    }
}
