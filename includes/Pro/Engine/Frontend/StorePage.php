<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\SupportHelper;
use YayWholesaleB2B\Pro\Helpers\TemplatesHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Store Page class
 */
class StorePage {
    use SingletonTrait;

    protected function __construct() {
        // Get shop page id
        add_filter( 'ywhs_shop_page_id', [ $this, 'get_shop_page_id' ] );

        // Change template with block-based theme
        add_filter( 'get_block_templates', [ $this, 'replace_templates' ], 999, 3 );
        add_filter( 'archive_template_hierarchy', [ $this, 'add_to_archive_template_hierachy' ] );

        // // Change template with classic theme
        // add_filter( 'template_include', [ $this, 'replace_templates_classic' ], 999, 1 );

        // // shop page query
        // add_action( 'pre_get_posts', [ $this, 'shop_page_products_query' ] );
    }

    /**
     * Get the shop page id currently use
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param int $page_id Page ID.
     * @return bool
     */
    public function get_shop_page_id( $page_id ) {
        $settings = SettingsHelper::get_settings();
        if ( SupportHelper::is_using_wc_shop_page( $settings ) || CustomerHelper::is_current_wholesale_customer() ) {
            return $page_id;
        } else {
            return $settings['general']['wholesale_store_page'];
        }
    }

    /**
     * Add the YayWholesale Template to the default template list
     *
     * @param array  $templates The templates list.
     * @param array  $query The Query.
     * @param string $template_type The template type.
     * @return array.
     */
    public function replace_templates( $templates, $query, $template_type ) {
        if ( 'wp_template' !== $template_type ) {
            return $templates;
        }

        if ( ! current_theme_supports( 'block-templates' ) ) {
            return $templates;
        }

        if ( ! is_shop() ) {
            return $templates;
        }

        $slug = TemplatesHelper::get_block_template_slug_by_role( CustomerHelper::get_current_user_wholesale_role() );
        if ( false === $slug ) {
            return $templates;
        }

        $new_template = get_block_template(
            get_stylesheet() . '//' . $slug,
            'wp_template'
        );

        $templates[] = $new_template;

        return $templates;
    }

    /**
     * Add the YayWholesale Template slug to the hierachy of shop page, mark it as the highest priority
     *
     * @param array $templates The templates hierachy.
     * @return array
     */
    public function add_to_archive_template_hierachy( $templates ) {
        if ( ! current_theme_supports( 'block-templates' ) ) {
            return $templates;
        }

        $slug = TemplatesHelper::get_block_template_slug_by_role( CustomerHelper::get_current_user_wholesale_role() );
        if ( false === $slug ) {
            return $templates;
        }

        return array_merge( [ $slug ], $templates );
    }

    public function replace_templates_classic( $template ) {
        if ( wp_is_block_theme() ) {
            return $template;
        }

        if ( ! is_shop() ) {
            return $template;
        }
        if ( wc_current_theme_supports_woocommerce_or_fse() ) {
            if ( CustomerHelper::is_current_wholesale_customer() ) {
                return YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/shop-template/wholesale-shop.php';
            } else {
                return YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Pro/Templates/shop-template/retail-shop.php';
            }
        } else {
            add_filter( 'the_content', [ $this, 'unsupported_theme_content' ] );
            add_filter( 'the_title', [ $this, 'unsupported_theme_title' ] );
        }
    }

    /**
     * Handle the content of page to add the products shortcode to the page's content (if Woocommerce is not supported)
     *
     * @param   string $content
     * @return  string
     */
    public function unsupported_theme_content( $content ) {
        if ( wc_current_theme_supports_woocommerce_or_fse() || ! is_main_query() || ! in_the_loop() ) {
            return $content;
        }

        remove_filter( 'the_content', [ $this, 'unsupported_theme_content' ] );

        $args = (object) [
            'page'    => max( 1, (int) get_query_var( 'paged' ) ),
            'columns' => wc_get_default_products_per_row(),
            'rows'    => wc_get_default_product_rows_per_page(),
        ];

        $shortcode = new \WC_Shortcode_Products(
            array_merge(
                WC()->query->get_catalog_ordering_args(),
                [
                    'page'     => $args->page,
                    'columns'  => $args->columns,
                    'rows'     => $args->rows,
                    'orderby'  => '',
                    'order'    => '',
                    'paginate' => true,
                    'cache'    => false,
                ]
            ),
            'products'
        );

        // add_action( 'pre_get_posts', [ WC()->query, 'product_query' ] );

        $content = $shortcode->get_content();

        // remove_action( 'pre_get_posts', [ WC()->query, 'product_query' ] );
        WC()->query->remove_ordering_args();

        return $content;
    }

    /**
     * Handle to add the setting page's title to the page's content (if Woocommerce is not supported)
     *
     * @param   string $title
     * @return  string
     */
    public function unsupported_theme_title( $title ) {
        $settings = SettingsHelper::get_settings();
        if ( wc_current_theme_supports_woocommerce_or_fse() ) {
            return $title;
        }

        remove_filter( 'the_title', [ $this, 'unsupported_theme_title_filter' ] );
        $title = get_the_title( (int) $settings['general']['wholesale_store_page'] );

        return $title;
    }

    public function shop_page_products_query( $query ) {
        if ( ! $query->is_main_query() || ! wc_current_theme_supports_woocommerce_or_fse() ) {
            return;
        }

        if ( ! CustomerHelper::is_current_wholesale_customer() ) {
            return;
        }

        $page_id = intval( $query->get( 'page_id' ) );
        if ( ! $page_id ) {
            $page_id = $query->get_queried_object_id();
        }

        $settings = SettingsHelper::get_full_settings();

        if ( $page_id !== intval( $settings['general']['wholesale_store_page'] ) ) {
            return;
        }

        global $wp_post_types;
        $store_page = get_post( $page_id );

        $wp_post_types['product']->ID         = $store_page->ID ?? 0;
        $wp_post_types['product']->post_title = $store_page->post_title ?? '';
        $wp_post_types['product']->post_name  = $store_page->post_name ?? '';
        $wp_post_types['product']->post_type  = $store_page->post_type ?? '';
        $wp_post_types['product']->ancestors  = get_ancestors( $wp_post_types['product']->ID, $wp_post_types['product']->post_type );

        // Fix conditionals
        $query->is_singular          = false;
        $query->is_post_type_archive = true;
        $query->is_archive           = true;
        $query->is_page              = true;

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['s'] ) ) {
            $query->is_search = true;
        }

        $query->set( 'post_type', 'product' );
        $query->set( 'page_id', 0 );
        $query->set( 'pagename', '' );
        $query->set( 'name', '' );
        $query->set( 'is_post_type_archive', 'product' );

        // Page
        if ( isset( $query->query['paged'] ) ) {
            $query->set( 'paged', $query->query['paged'] );
        }

        // Order By
        if ( isset( $query->query['orderby'] ) ) {
            $order_map = explode( '-', $query->query['orderby'] );
            $orderby   = $order_map[0];
            $order     = strtoupper( $order_map[1] ?? 'asc' );
            $args      = [
                'orderby' => $orderby,
                'order'   => $order,
            ];

            $args = apply_filters( 'woocommerce_get_catalog_ordering_args', $args, $orderby, $order );

            $query->set( 'orderby', $args['orderby'] );
            $query->set( 'order', $args['order'] );
        }

        // Query vars that affect posts shown.
        // $query->set( 'meta_query', $this->get_meta_query( $query->get( 'meta_query' ), true ) );
        // $query->set( 'tax_query', $this->get_tax_query( $query->get( 'tax_query' ), true ) );
        $query->set( 'wc_query', 'product_query' );
        $query->set( 'post__in', array_unique( (array) apply_filters( 'loop_shop_post_in', [] ) ) );

        // Set perpage
        $query->set( 'posts_per_page', $query->get( 'posts_per_page' ) ? $query->get( 'posts_per_page' ) : apply_filters( 'loop_shop_per_page', wc_get_default_products_per_row() * wc_get_default_product_rows_per_page() ) );
    }
}
