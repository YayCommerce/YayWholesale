<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use Override;
use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\GuestAccessHelper;
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
        // Visibility
        add_filter( 'pre_get_posts', [ $this, 'restrict_product_access_in_block_catalog' ], 999, 2 );
        // Purchasable
        add_filter( 'woocommerce_is_purchasable', [ $this, 'restrict_product_purchasable' ], 10, 2 );

        // -----Variation-----
        // Visibility
        add_filter( 'woocommerce_variation_is_visible', [ $this, 'restrict_variation_visibility' ], 10, 2 );
        // Purchasable
        add_filter( 'woocommerce_variation_is_purchasable', [ $this, 'restrict_variation_purchasable' ], 10, 2 );

        // -----Category-----
        add_filter( 'get_terms', [ $this, 'restrict_category_visibility' ], 10, 3 );

        // -----Guest----
        add_action( 'woocommerce_get_price_html', [ $this, 'price_display_for_guest' ], 101, 1 );
        add_action( 'template_redirect', [ $this, 'redirect_guests_to_login_on_shop' ], 100 );
    }

    /**
     * Prevent from purchasing the blocked product (single products, grouped product's children)
     *
     * @param bool        $purchasable  If the product is purchasable.
     * @param \WC_Product $product The product ID.
     * @return bool
     */
    public function restrict_product_purchasable( $purchasable, $product ) {
        $wholesale_role         = CustomerHelper::get_current_user_wholesale_role();
        $accessible_by_product  = ProductAccessHelper::is_accessible_product( $purchasable, $product->get_id(), $wholesale_role );
        $accessible_by_category = CategoryAccessHelper::is_accessible_product_by_categories( $product, $wholesale_role );
        $accessible_by_guest    = is_user_logged_in() || GuestAccessHelper::get_guest_access_rule() === 'no-restriction';
        return $accessible_by_product && $accessible_by_category && $accessible_by_guest;
    }

    /**
     * Hide the variation option in variable product
     *
     * @param bool $visible      If the variation is visible.
     * @param int  $variation_id The variation.
     * @return bool
     */
    public function restrict_variation_visibility( $visible, $variation_id ) {
        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        return ProductAccessHelper::is_accessible_product( $visible, $variation_id, $wholesale_role );
    }

    /**
     * Prevent from purchasing a variation
     *
     * @param bool                  $purchasable  If the variation is purchasable.
     * @param \WC_Product_Variation $variation The variation.
     * @return bool
     */
    public function restrict_variation_purchasable( $purchasable, $variation ) {
        $wholesale_role         = CustomerHelper::get_current_user_wholesale_role();
        $parent_product         = wc_get_product( $variation->get_parent_id() );
        $accessible_by_product  = ProductAccessHelper::is_accessible_product( $purchasable, $variation->get_id(), $wholesale_role );
        $accessible_by_category = CategoryAccessHelper::is_accessible_product_by_categories( $parent_product, $wholesale_role );
        return $accessible_by_product && $accessible_by_category;
    }

    /**
     * Hide the product in catalog page
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

        $tax_query     = (array) $query->get( 'tax_query' );
        $visible_terms = get_terms(
            [
                'taxonomy' => 'product_cat',
            ]
        );

        $tax_query[] = [
            'taxonomy'         => 'product_cat',
            'field'            => 'slug',
            'terms'            => array_column( $visible_terms, 'slug' ),
            'operator'         => 'IN',
            'include_children' => false,
        ];

        $query->set( 'tax_query', $tax_query );
        add_filter( 'pre_get_posts', [ $this, 'restrict_product_access_in_block_catalog' ], 10, 2 );

        return $query;
    }

    /**
     * Hidden the category in catalog page
     *
     * @param array $terms  The unfiltered terms.
     * @param array $taxonomies The taxonomies.
     * @param array $args The argument.
     * @return array
     */
    public function restrict_category_visibility( array $terms, array $taxonomies, $args ) {
        if ( is_admin() && ! wp_doing_ajax() ) {
            return $terms;
        }

        if ( ! is_shop() && ! is_product_category() ) {
            return $terms;
        }

        if ( ! in_array( 'product_cat', $taxonomies, true ) ) {
            return $terms;
        }

        if ( ! empty( $args['ywhs_force_get_all'] ) ) {
            return $terms;
        }

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        $terms          = CategoryAccessHelper::filter_accessible_categories( $terms, $wholesale_role );

        return $terms;
    }

    /**
     * Display the "Login to view prices" for guest
     *
     * @param string $price_html The price HTML.
     * @return string The displayed HTML.
     */
    public function price_display_for_guest( string $price_html ) {
        if ( is_user_logged_in() ) {
            return $price_html;
        }

        $rule = GuestAccessHelper::get_guest_access_rule();

        if ( 'hidden-prices' === $rule ) {
            return "<div><a style='cursor:pointer' href='" . wc_get_page_permalink( 'myaccount' ) . "' >" . __( 'Log in to view prices', 'yay-wholesale-b2b' ) . '</a></div>';
        }

        return $price_html;
    }

    /**
     * Redirect to login page when guest access to shop page
     */
    public function redirect_guests_to_login_on_shop() {
        if ( is_user_logged_in() || is_page( [ 'my-account', 'login' ] ) || is_admin() ) {
            return;
        }
        $rule = GuestAccessHelper::get_guest_access_rule();
        if ( 'hidden-entire-shop' === $rule ) {
            if ( is_shop() || is_product_category() || is_product_tag() || is_product() ) {
                $login_url = wc_get_page_permalink( 'myaccount' );

                $redirect_back = add_query_arg( 'redirect_to', rawurlencode( get_permalink() ), $login_url );

                wp_safe_redirect( $redirect_back );
                exit;
            }
        }
    }
}
