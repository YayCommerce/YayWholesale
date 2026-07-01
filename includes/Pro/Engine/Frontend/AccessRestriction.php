<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use Override;
use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Payment Method Engine — Role-based Restrict Payment .
 */
class AccessRestriction {
    use SingletonTrait;

    public function __construct() {
        // -----Product-----
        // Visibility: Legacy: [products] shortcode
        add_filter( 'woocommerce_product_is_visible', [ $this, 'restrict_product_access_in_legacy_catalog' ], 10, 2 );
        // Visibility: Block-based
        add_filter( 'pre_get_posts', [ $this, 'restrict_product_access_in_block_catalog' ], 999, 2 );
        // Purchasable
        add_filter( 'woocommerce_is_purchasable', [ $this, 'restrict_product_purchasable' ], 10, 2 );

        // -----Variation-----
        // Visibility
        add_filter( 'woocommerce_variation_is_visible', [ $this, 'restrict_variation_visibility' ], 10, 2 );
        // Purchasable
        add_filter( 'woocommerce_variation_is_purchasable', [ $this, 'restrict_variation_purchasable' ], 10, 2 );
    }

    /**
     * Hide the product in catalog page, only working on [products] shortcode page
     *
     * @param bool $visible  If the product is visible.
     * @param int  $product_id The product ID.
     * @return bool
     */
    public function restrict_product_access_in_legacy_catalog( $visible, $product_id ) {
        return ProductAccessHelper::is_accessible_to_product( $visible, $product_id );
    }

    /**
     * Prevent from purchasing the blocked product (single products, grouped product's children)
     *
     * @param bool        $purchasable  If the product is purchasable.
     * @param \WC_Product $product The product ID.
     * @return bool
     */
    public function restrict_product_purchasable( $purchasable, $product ) {
        return ProductAccessHelper::is_accessible_to_product( $purchasable, $product->get_id() );
    }

    /**
     * Hide the variation option in variable product
     *
     * @param bool $visible      If the variation is visible.
     * @param int  $variation_id The variation.
     * @return bool
     */
    public function restrict_variation_visibility( $visible, $variation_id ) {
        return ProductAccessHelper::is_accessible_to_product( $visible, $variation_id );
    }

    /**
     * Prevent from purchasing a variation
     *
     * @param bool                  $purchasable  If the variation is purchasable.
     * @param \WC_Product_Variation $variation The variation.
     * @return bool
     */
    public function restrict_variation_purchasable( $purchasable, $variation ) {
        return ProductAccessHelper::is_accessible_to_product( $purchasable, $variation->get_id() );
    }

    /**
     * Hide the product in catalog page (Block based)
     *
     * @param \WP_Query $query  the products query.
     * @return \WP_Query
     */
    public function restrict_product_access_in_block_catalog( \WP_Query $query ) {
        if ( did_action( 'woocommerce_init' ) * did_action( 'woocommerce_after_register_taxonomy' ) * did_action( 'woocommerce_after_register_post_type' ) === 0 ) {
            return $query;
        }

        if ( $query->get( 'post_type' ) !== 'product' || ! wc_current_theme_supports_woocommerce_or_fse() ) {
            return $query;
        }
        $shop_page         = apply_filters( 'ywhs_shop_page_id', wc_get_page_id( 'shop' ) );
        $is_main_shop_page = $query->get_queried_object() && ( $query->is_post_type_archive( 'product' ) || $query->is_page( $shop_page ) );
        if ( ! $is_main_shop_page || is_admin() ) {
            return $query;
        }

        remove_filter( 'pre_get_posts', [ $this, 'restrict_product_access_in_block_catalog' ] );

        // All products id that is blocked (products and variations)
        $general_hidden_product_ids = ProductAccessHelper::get_blocked_product_ids( CustomerHelper::get_current_user_wholesale_role() );
        // Variable and Grouped Product ids (if all the children are blocked, then blocked the parent too)
        $product_with_all_children_hidden_ids = ProductAccessHelper::get_blocked_product_with_children_ids( $general_hidden_product_ids );

        // Blocked Product IDs
        $hidden_ids = array_merge( $general_hidden_product_ids, $product_with_all_children_hidden_ids );

        $query->set( 'post__not_in', array_merge( (array) $query->get( 'post__not_in' ), $hidden_ids ) );

        add_filter( 'pre_get_posts', [ $this, 'restrict_product_access_in_block_catalog' ], 10, 2 );

        return $query;
    }
}
