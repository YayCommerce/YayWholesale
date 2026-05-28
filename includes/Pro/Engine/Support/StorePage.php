<?php
namespace YayWholesaleB2B\Pro\Engine\Support;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\SupportHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Support class
 */
class StorePage {
    use SingletonTrait;

    private $settings;

    protected function __construct() {
        $this->settings = SettingsHelper::get_settings();
        if ( SupportHelper::is_using_wc_shop_page( $this->settings ) ) {
            return;
        }

        // Load template (title, content)
        add_filter( 'template_include', [ $this, 'load_template' ] );
        // Load products
        add_action( 'pre_get_posts', [ $this, 'store_products_query' ] );

        // Clean resource, query
        add_filter( 'theme_page_templates', [ $this, 'hide_page_templates' ], 10, 3 );
        add_filter( 'the_posts', [ $this, 'remove_product_query_filters' ] );

        // Redirect by role
        add_action( 'template_redirect', [ $this, 'handle_redirects' ] );

        // Customize the page
        add_filter( 'woocommerce_page_title', [ $this, 'page_title' ] );
        add_action( 'woocommerce_archive_description', [ $this, 'page_content' ], 2 );
        add_filter( 'woocommerce_get_breadcrumb', [ $this, 'page_breadcrumb' ], 10, 2 );
        add_filter( 'document_title_parts', [ $this, 'document_title_parts' ] );

        // Hide Menu
        add_filter( 'wp_get_nav_menu_items', [ $this, 'handler_menu' ], 10, 1 );
        add_filter( 'wp_list_pages_excludes', [ $this, 'handler_list_pages' ] );
    }

    /**
     * Load the archive-product.php template
     *
     * @param   string $template
     * @return  string $template
     */
    public function load_template( $template ) {
        if ( ! SupportHelper::is_wholesale_shop_page( $this->settings ) ) {
            return $template;
        }

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        if ( ! isset( $wholesale_role ) ) {
            return $template;
        }

        if ( ! SupportHelper::has_block_template( 'archive-product' ) ) {
            if ( wc_current_theme_supports_woocommerce_or_fse() ) {
                $woocommerce_template = locate_template( 'woocommerce.php' );

                if ( $woocommerce_template ) {
                    return $woocommerce_template;
                }

                $archive_product = locate_template( 'woocommerce/archive-product.php' );

                if ( $archive_product ) {
                    return $archive_product;
                }

                $factory_template = wc_locate_template( 'archive-product.php' );

                if ( $factory_template ) {
                    return $factory_template;
                }
            } else {
                add_filter( 'the_content', [ $this, 'unsupported_theme_shop_content_filter' ] );
                add_filter( 'the_title', [ $this, 'unsupported_theme_title_filter' ] );
            }//end if
        }//end if

        return $template;
    }

    /**
     * Handle the content of page to add the products shortcode to the page's content (if Woocommerce is not supported)
     *
     * @param   string $content
     * @return  string
     */
    public function unsupported_theme_shop_content_filter( $content ) {
        if ( wc_current_theme_supports_woocommerce_or_fse() || ! is_main_query() || ! in_the_loop() ) {
            return $content;
        }

        remove_filter( 'the_content', [ $this, 'unsupported_theme_shop_content_filter' ] );

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

        add_action( 'pre_get_posts', [ WC()->query, 'product_query' ] );

        $content = $shortcode->get_content();

        remove_action( 'pre_get_posts', [ WC()->query, 'product_query' ] );
        WC()->query->remove_ordering_args();

        return $content;
    }

    /**
     * Handle to add the setting page's title to the page's content (if Woocommerce is not supported)
     *
     * @param   string $title
     * @return  string
     */
    public function unsupported_theme_title_filter( $title ) {
        if ( wc_current_theme_supports_woocommerce_or_fse() ) {
            return $title;
        }

        remove_filter( 'the_title', [ $this, 'unsupported_theme_title_filter' ] );
        $title = get_the_title( (int) $this->settings['general']['wholesale_store_page'] );

        return $title;
    }


    // ------------------------------------------------------
    /**
     * When editing the wholesale store page, we should hide templates.
     *
     * @param array   $page_templates Templates array.
     * @param string  $theme Classname.
     * @param WP_Post $post The current post object.
     * @return array
     */
    public function hide_page_templates( $page_templates, $theme, $post ) {
        $wholesale_store_page_id = (int) $this->settings['general']['wholesale_store_page'];

        if ( $post && intval( $post->ID ) === $wholesale_store_page_id ) {
            $page_templates = [];
        }

        return $page_templates;
    }


    /**
     * Hijack the query and turn our normal page into a store page
     *
     * @param WP_Query $q
     */
    public function store_products_query( $q ) {
        if ( ! $q->is_main_query() || ! wc_current_theme_supports_woocommerce_or_fse() ) {
            return;
        }

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        if ( ! isset( $wholesale_role ) ) {
            return;
        }

            $page_id = (int) $q->get( 'page_id' );

        if ( ! $page_id ) {
            $page_id = $q->get_queried_object_id();
        }

            // bail if we are on front page and it's not the wholesale store
            // hacky because WordPress has issues with is_front_page() inside pre_get_posts
        if ( get_option( 'show_on_front' ) === 'page' && get_option( 'page_on_front' ) && intval( get_option( 'page_on_front' ) ) === $page_id && $page_id !== (int) $this->settings['general']['wholesale_store_page'] ) {
            return;
        }

            // check wholesale not on front and whether this is wholesale store
        if ( get_option( 'page_on_front' ) !== (int) $this->settings['general']['wholesale_store_page'] && $page_id !== (int) $this->settings['general']['wholesale_store_page'] ) {
            return;
        }

            // When any admissible query vars is set, WordPress shows posts on the front-page. Get around that here.
        if ( $this->is_showing_page_on_front( $q ) && $this->page_on_front_is( (int) $this->settings['general']['wholesale_store_page'] ) ) {

            $_query = wp_parse_args( $q->query );

            // Query vars that should not trigger the front-page posts.
            $excluded_query_vars = [ 'preview', 'page', 'paged', 'cpage', 'orderby' ];

            // Query vars coming from the WWP price and rating filter widgets
            $excluded_query_vars = array_merge( $excluded_query_vars, [ 'min_price', 'max_price', 'rating_filter' ] );

            // Query vars coming from the WWP attribute filter widgets
            foreach ( wc_get_attribute_taxonomies() as $tax ) {
                if ( taxonomy_exists( wc_attribute_taxonomy_name( $tax->attribute_name ) ) ) {
                    $excluded_query_vars[] = 'filter_' . wc_attribute_taxonomy_slug( $tax->attribute_name );
                }
            }

            if ( empty( $_query ) || empty( array_diff( array_keys( $_query ), $excluded_query_vars ) ) ) {
                $page_id = (int) get_option( 'page_on_front' );
                $q->set( 'page_id', $page_id );
                $q->is_page = true;
                $q->is_home = false;

                // WP supporting themes show post type archive.
                if ( current_theme_supports( 'woocommerce' ) ) {
                    $q->set( 'post_type', 'product' );
                } else {
                    $q->is_singular = true;
                }
            }
        }//end if

        if ( $q->is_page() && $page_id === (int) $this->settings['general']['wholesale_store_page'] ) {
            if ( 'page' === get_option( 'show_on_front' ) ) {
                // Remove post type archive name from front page title tag.
                add_filter( 'post_type_archive_title', '__return_empty_string', 5 );
            }
        } else {
            return;
        }

            $this->product_query( $q );
    }

    /**
     * Fix the breadcrumb
     *
     * @param   array          $crumbs
     * @param   \WC_Breadcrumb $breadcrumb
     * @return  array           $crumbs
     */
    public function page_breadcrumb( $crumbs, \WC_Breadcrumb $breadcrumb ) {
        if ( ! SupportHelper::is_wholesale_shop_page( $this->settings ) ) {
            return $crumbs;
        }

        $shop_key = array_search( get_permalink( wc_get_page_id( 'shop' ) ), array_column( $crumbs, 1 ), true );

        if ( $shop_key ) {
            unset( $crumbs[ $shop_key ] );
            array_values( $crumbs );
        }

        $wholesale_crumb = [
            get_the_title( (int) $this->settings['general']['wholesale_store_page'] ),
            SupportHelper::get_wholesale_store_url( $this->settings ),
        ];

        array_splice( $crumbs, 1, 0, [ $wholesale_crumb ] );

        return $crumbs;
    }

    /**
     * Fix the page title
     *
     * @param   string $page_title
     * @return  string $page_title
     */
    public function page_title( $page_title ) {
        if ( ! SupportHelper::is_wholesale_shop_page( $this->settings ) ) {
            return $page_title;
        }

        if ( is_search() ) {
            /* translators: %s: search query */
            $page_title = sprintf( __( 'Search results for &ldquo;%s&rdquo;', 'yay-wholesale-b2b' ), get_search_query() );
        } else {
            $page_title = get_the_title( (int) $this->settings['general']['wholesale_store_page'] );
        }

        return $page_title;
    }

    /**
     * Load in the page content above the loop
     */
    public function page_content() {
        if ( ! SupportHelper::is_wholesale_shop_page( $this->settings ) ) {
            return;
        }

        $page = get_post( (int) $this->settings['general']['wholesale_store_page'] );

        // phpcs:ignore
        echo apply_filters( 'the_content', $page->post_content );
    }

    /**
     * Query the products, applying sorting/ordering etc.
     *
     * @param WP_Query $q Query instance.
     */
    public function product_query( $q ) {
        global $wp_post_types;
        $wholesale_shop_page = get_post( (int) $this->settings['general']['wholesale_store_page'] );

        $wp_post_types['product']->ID         = $wholesale_shop_page->ID ?? 0;
        $wp_post_types['product']->post_title = $wholesale_shop_page->post_title ?? '';
        $wp_post_types['product']->post_name  = $wholesale_shop_page->post_name ?? '';
        $wp_post_types['product']->post_type  = $wholesale_shop_page->post_type ?? '';
        $wp_post_types['product']->ancestors  = get_ancestors( $wp_post_types['product']->ID, $wp_post_types['product']->post_type );

        // Fix conditionals
        $q->is_singular          = false;
        $q->is_post_type_archive = true;
        $q->is_archive           = true;
        $q->is_page              = true;

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['s'] ) ) {
            $q->is_search = true;
        }

        $q->set( 'post_type', 'product' );
        $q->set( 'page_id', 0 );
        $q->set( 'pagename', '' );
        $q->set( 'name', '' );
        $q->set( 'is_post_type_archive', 'product' );

        if ( isset( $q->query['paged'] ) ) {
            $q->set( 'paged', $q->query['paged'] );
        }

        if ( ! is_feed() ) {
            $ordering = $this->get_catalog_ordering_args();
            $q->set( 'orderby', $ordering['orderby'] );
            $q->set( 'order', $ordering['order'] );

            if ( isset( $ordering['meta_key'] ) ) {
                $q->set( 'meta_key', $ordering['meta_key'] );
            }
        }

        // Query vars that affect posts shown.
        $q->set( 'meta_query', $this->get_meta_query( $q->get( 'meta_query' ), true ) );
        $q->set( 'tax_query', $this->get_tax_query( $q->get( 'tax_query' ), true ) );
        $q->set( 'wc_query', 'product_query' );
        $q->set( 'post__in', array_unique( (array) apply_filters( 'loop_shop_post_in', [] ) ) );

        // Work out how many products to query.
        $q->set( 'posts_per_page', $q->get( 'posts_per_page' ) ? $q->get( 'posts_per_page' ) : apply_filters( 'loop_shop_per_page', wc_get_default_products_per_row() * wc_get_default_product_rows_per_page() ) );

        if ( ! $this->is_woocommerce_3_5() ) {
            add_filter( 'posts_clauses', [ $this, 'price_filter_post_clauses' ], 10, 2 );
        }
    }

    /**
     * Appends meta queries to an array.
     *
     * @see WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param  array $meta_query Meta query.
     * @param  bool  $main_query If is main query.
     * @return array
     */
    public function get_meta_query( $meta_query = [], $main_query = false ) {
        if ( ! is_array( $meta_query ) ) {
            $meta_query = [];
        }

        return $meta_query;
    }

    /**
     * Appends tax queries to an array.
     *
     * @see WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param  array $tax_query  Tax query.
     * @param  bool  $main_query If is main query.
     * @return array
     */
    public function get_tax_query( $tax_query = [], $main_query = false ) {
        if ( ! is_array( $tax_query ) ) {
            $tax_query = [
                'relation' => 'AND',
            ];
        }

        // Layered nav filters on terms.
        if ( $main_query ) {
            foreach ( \WC_Query::get_layered_nav_chosen_attributes() as $taxonomy => $data ) {
                $tax_query[] = [
                    'taxonomy'         => $taxonomy,
                    'field'            => 'slug',
                    'terms'            => $data['terms'],
                    'operator'         => 'and' === $data['query_type'] ? 'AND' : 'IN',
                    'include_children' => false,
                ];
            }
        }

        $product_visibility_terms  = wc_get_product_visibility_term_ids();
        $product_visibility_not_in = [ is_search() && $main_query ? $product_visibility_terms['exclude-from-search'] : $product_visibility_terms['exclude-from-catalog'] ];

        // Hide out of stock products.
        if ( 'yes' === get_option( 'woocommerce_hide_out_of_stock_items' ) ) {
            $product_visibility_not_in[] = $product_visibility_terms['outofstock'];
        }

        // Filter by rating.
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        if ( isset( $_GET['rating_filter'] ) ) {
            $rating_filter = array_filter( array_map( 'absint', explode( ',', sanitize_text_field( wp_unslash( $_GET['rating_filter'] ) ) ) ) );
            // phpcs:enable WordPress.Security.NonceVerification.Recommended
            $rating_terms = [];
            for ( $i = 1; $i <= 5; $i++ ) {
                if ( in_array( $i, $rating_filter, true ) && isset( $product_visibility_terms[ 'rated-' . $i ] ) ) {
                    $rating_terms[] = $product_visibility_terms[ 'rated-' . $i ];
                }
            }
            if ( ! empty( $rating_terms ) ) {
                $tax_query[] = [
                    'taxonomy'      => 'product_visibility',
                    'field'         => 'term_taxonomy_id',
                    'terms'         => $rating_terms,
                    'operator'      => 'IN',
                    'rating_filter' => true,
                ];
            }
        }

        if ( ! empty( $product_visibility_not_in ) ) {
            $tax_query[] = [
                'taxonomy' => 'product_visibility',
                'field'    => 'term_taxonomy_id',
                'terms'    => $product_visibility_not_in,
                'operator' => 'NOT IN',
            ];
        }

        /**
         * Filters the Wholesale Store page tax query.
         *
         * @param array $tax_query The tax query formatted for a WP_Query.
         */
        return array_filter( apply_filters( 'ywhs_store_query_tax_query', $tax_query ) );
    }

    /**
     * Returns an array of arguments for ordering products based on the selected values.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param string $orderby Order by param.
     * @param string $order Order param.
     * @return array
     */
    public function get_catalog_ordering_args( $orderby = '', $order = '' ) {
        // Get ordering from query string unless defined.
        if ( ! $orderby ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $orderby_value = isset( $_GET['orderby'] ) ? wc_clean( (string) sanitize_text_field( wp_unslash( $_GET['orderby'] ) ) ) : wc_clean( get_query_var( 'orderby' ) );

            if ( ! $orderby_value ) {
                if ( is_search() ) {
                    $orderby_value = 'relevance';
                } else {
                    $orderby_value = apply_filters( 'woocommerce_default_catalog_orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );
                }
            }

            // Get order + orderby args from string.
            $orderby_value = is_array( $orderby_value ) ? $orderby_value : explode( '-', $orderby_value );
            $orderby       = esc_attr( $orderby_value[0] );
            $order         = ! empty( $orderby_value[1] ) ? $orderby_value[1] : $order;
        }

        // Convert to correct format.
        $orderby = strtolower( is_array( $orderby ) ? (string) current( $orderby ) : (string) $orderby );
        $order   = strtoupper( is_array( $order ) ? (string) current( $order ) : (string) $order );
        $args    = [
            'orderby' => $orderby,
            'order'   => ( 'DESC' === $order ) ? 'DESC' : 'ASC',
        'meta_key' => '', // @codingStandardsIgnoreLine
        ];

        switch ( $orderby ) {
            case 'id':
                $args['orderby'] = 'ID';
                break;
            case 'menu_order':
                $args['orderby'] = 'menu_order title';
                break;
            case 'title':
                $args['orderby'] = 'title';
                $args['order']   = ( 'DESC' === $order ) ? 'DESC' : 'ASC';
                break;
            case 'relevance':
                $args['orderby'] = 'relevance';
                $args['order']   = 'DESC';
                break;
            case 'rand':
                $args['orderby'] = 'rand'; // @codingStandardsIgnoreLine
                break;
            case 'date':
                $args['orderby'] = 'date ID';
                $args['order']   = ( 'ASC' === $order ) ? 'ASC' : 'DESC';
                break;
            case 'price':
                $callback = 'DESC' === $order ? 'order_by_price_desc_post_clauses' : 'order_by_price_asc_post_clauses';
                $callback = $this->is_woocommerce_3_5() ? $callback . '_3_5' : $callback;
                add_filter( 'posts_clauses', [ $this, $callback ] );

                break;
            case 'popularity':
                if ( $this->is_woocommerce_3_5() ) {
                    $args['meta_key'] = 'total_sales'; // @codingStandardsIgnoreLine
                    add_filter( 'posts_clauses', [ $this, 'order_by_popularity_post_clauses_3_5' ] );
                } else {
                    add_filter( 'posts_clauses', [ $this, 'order_by_popularity_post_clauses' ] );
                }

                break;
            case 'rating':
                if ( $this->is_woocommerce_3_5() ) {
                    $args['meta_key'] = '_wc_average_rating'; // @codingStandardsIgnoreLine
                    $args['orderby']  = [
                        'meta_value_num' => 'DESC',
                        'ID'             => 'ASC',
                    ];
                } else {
                    add_filter( 'posts_clauses', [ $this, 'order_by_rating_post_clauses' ] );
                }
                break;
        }//end switch

        return apply_filters( 'woocommerce_get_catalog_ordering_args', $args, $orderby, $order );
    }

    /**
     * Custom query used to filter products by price.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     * @since 3.6.0
     *
     * @param array    $args Query args.
     * @param WC_Query $wp_query WC_Query object.
     *
     * @return array
     */
    public function price_filter_post_clauses( $args, $wp_query ) {
        global $wpdb;

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! $wp_query->is_main_query() || ( ! isset( $_GET['max_price'] ) && ! isset( $_GET['min_price'] ) ) ) {
            return $args;
        }

        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        $current_min_price = isset( $_GET['min_price'] ) ? floatval( wp_unslash( $_GET['min_price'] ) ) : 0;
        $current_max_price = isset( $_GET['max_price'] ) ? floatval( wp_unslash( $_GET['max_price'] ) ) : PHP_INT_MAX;
        // phpcs:enable WordPress.Security.NonceVerification.Recommended

        /**
         * Adjust if the store taxes are not displayed how they are stored.
         * Kicks in when prices excluding tax are displayed including tax.
         */
        if ( wc_tax_enabled() && 'incl' === get_option( 'woocommerce_tax_display_shop' ) && ! wc_prices_include_tax() ) {
            $tax_class = apply_filters( 'woocommerce_price_filter_widget_tax_class', '' );
            // Uses standard tax class.
            $tax_rates = \WC_Tax::get_rates( $tax_class );

            if ( $tax_rates ) {
                $current_min_price -= \WC_Tax::get_tax_total( \WC_Tax::calc_inclusive_tax( $current_min_price, $tax_rates ) );
                $current_max_price -= \WC_Tax::get_tax_total( \WC_Tax::calc_inclusive_tax( $current_max_price, $tax_rates ) );
            }
        }

        $args['join']   = $this->append_product_sorting_table_join( $args['join'] );
        $args['where'] .= $wpdb->prepare(
            ' AND wc_product_meta_lookup.min_price >= %f AND wc_product_meta_lookup.max_price <= %f ',
            $current_min_price,
            $current_max_price
        );
        return $args;
    }

    /**
     * Handle numeric price sorting.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_price_asc_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.min_price ASC, wc_product_meta_lookup.product_id ASC ';
        return $args;
    }

    /**
     * Handle numeric price sorting.
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_price_asc_post_clauses_3_5( $args ) {
        global $wpdb, $wp_query;

        if ( isset( $wp_query->queried_object, $wp_query->queried_object->term_taxonomy_id, $wp_query->queried_object->taxonomy ) && is_a( $wp_query->queried_object, 'WP_Term' ) ) {
            $search_within_terms   = get_terms(
                [
                    'taxonomy' => $wp_query->queried_object->taxonomy,
                    'child_of' => $wp_query->queried_object->term_id,
                    'fields'   => 'tt_ids',
                ]
            );
            $search_within_terms[] = $wp_query->queried_object->term_taxonomy_id;
            $args['join']         .= " INNER JOIN (
				SELECT post_id, min( meta_value+0 ) price
				FROM $wpdb->postmeta
				INNER JOIN (
					SELECT $wpdb->term_relationships.object_id
					FROM $wpdb->term_relationships
					WHERE 1=1
					AND $wpdb->term_relationships.term_taxonomy_id IN (" . implode( ',', array_map( 'absint', $search_within_terms ) ) . ")
				) as products_within_terms ON $wpdb->postmeta.post_id = products_within_terms.object_id
				WHERE meta_key='_price' GROUP BY post_id ) as ywhs_price_query ON $wpdb->posts.ID = ywhs_price_query.post_id ";
        } else {
            $args['join'] .= " INNER JOIN ( SELECT post_id, min( meta_value+0 ) price FROM $wpdb->postmeta WHERE meta_key='_price' GROUP BY post_id ) as ywhs_price_query ON $wpdb->posts.ID = ywhs_price_query.post_id ";
        }//end if
        $args['orderby'] = " ywhs_price_query.price ASC, $wpdb->posts.ID ASC ";
        return $args;
    }

    /**
     * Handle numeric price sorting.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_price_desc_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.max_price DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * Handle numeric price sorting for WC 3.5
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_price_desc_post_clauses_3_5( $args ) {
        global $wpdb, $wp_query;

        if ( isset( $wp_query->queried_object, $wp_query->queried_object->term_taxonomy_id, $wp_query->queried_object->taxonomy ) && is_a( $wp_query->queried_object, 'WP_Term' ) ) {
            $search_within_terms   = get_terms(
                [
                    'taxonomy' => $wp_query->queried_object->taxonomy,
                    'child_of' => $wp_query->queried_object->term_id,
                    'fields'   => 'tt_ids',
                ]
            );
            $search_within_terms[] = $wp_query->queried_object->term_taxonomy_id;
            $args['join']         .= " INNER JOIN (
				SELECT post_id, max( meta_value+0 ) price
				FROM $wpdb->postmeta
				INNER JOIN (
					SELECT $wpdb->term_relationships.object_id
					FROM $wpdb->term_relationships
					WHERE 1=1
					AND $wpdb->term_relationships.term_taxonomy_id IN (" . implode( ',', array_map( 'absint', $search_within_terms ) ) . ")
				) as products_within_terms ON $wpdb->postmeta.post_id = products_within_terms.object_id
				WHERE meta_key='_price' GROUP BY post_id ) as ywhs_price_query ON $wpdb->posts.ID = ywhs_price_query.post_id ";
        } else {
            $args['join'] .= " INNER JOIN ( SELECT post_id, max( meta_value+0 ) price FROM $wpdb->postmeta WHERE meta_key='_price' GROUP BY post_id ) as ywhs_price_query ON $wpdb->posts.ID = ywhs_price_query.post_id ";
        }//end if

        $args['orderby'] = " ywhs_price_query.price DESC, $wpdb->posts.ID DESC ";
        return $args;
    }

    /**
     * WP Core does not let us change the sort direction for individual orderby params - https://core.trac.wordpress.org/ticket/17065.
     *
     * This lets us sort by meta value desc, and have a second orderby param.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_popularity_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.total_sales DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * WP Core doens't let us change the sort direction for individual orderby params - https://core.trac.wordpress.org/ticket/17065.
     *
     * This lets us sort by meta value desc, and have a second orderby param.
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_popularity_post_clauses_3_5( $args ) {
        global $wpdb;
        $args['orderby'] = "$wpdb->postmeta.meta_value+0 DESC, $wpdb->posts.post_date DESC";
        return $args;
    }

    /**
     * Order by rating post clauses.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param array $args Query args.
     * @return array
     */
    public function order_by_rating_post_clauses( $args ) {
        $args['join']    = $this->append_product_sorting_table_join( $args['join'] );
        $args['orderby'] = ' wc_product_meta_lookup.average_rating DESC, wc_product_meta_lookup.product_id DESC ';
        return $args;
    }

    /**
     * Pre_get_posts above may adjust the main query to add WooCommerce logic. When this query is done, we need to ensure
     * all custom filters are removed.
     *
     * This is done here during the_posts filter. The input is not changed.
     *
     * @param array $posts Posts from WP Query.
     * @return array
     */
    public function remove_product_query_filters( $posts ) {
        if ( $this->is_woocommerce_3_5() ) {
            $this->remove_ordering_args_3_5();
        } else {
            $this->remove_ordering_args();
        }

        return $posts;
    }

    /**
     * Remove ordering queries.
     */
    public function remove_ordering_args() {
        remove_filter( 'posts_clauses', [ $this, 'order_by_price_asc_post_clauses' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_price_desc_post_clauses' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_popularity_post_clauses' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_rating_post_clauses' ] );
    }

    /**
     * Remove ordering queries.
     */
    public function remove_ordering_args_3_5() {
        remove_filter( 'posts_clauses', [ $this, 'order_by_price_asc_post_clauses_3_5' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_price_desc_post_clauses_3_5' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_popularity_post_clauses_3_5' ] );
        remove_filter( 'posts_clauses', [ $this, 'order_by_rating_post_clauses' ] );
        remove_filter( 'posts_clauses', [ $this, 'price_filter_post_clauses' ], 10, 2 );
    }

    /**
     * Handle page redirects.
     */
    public function handle_redirects() {
        $role = CustomerHelper::get_current_user_wholesale_role();

        if ( SupportHelper::is_using_wc_shop_page( $this->settings ) ) {
            return;
        }

        if ( is_shop() && ! SupportHelper::is_wholesale_shop_page( $this->settings ) && is_user_logged_in() && isset( $role ) ) {
            $url = SupportHelper::get_wholesale_store_url( $this->settings );

            if ( ! $url ) {
                return;
            }

            if ( is_search() ) {
                // redirect WC product search to wholesale page for wholesale users

                if ( isset( $_GET['s'] ) && isset( $_GET['post_type'] ) && 'product' === $_GET['post_type'] ) {
                    $url = esc_url_raw(
                        add_query_arg(
                            [
                                's'         => sanitize_text_field( wp_unslash( $_GET['s'] ) ),
                                'post_type' => 'product',
                            ],
                            $url
                        )
                    );
                }
            }

            wp_safe_redirect( $url );
            exit;
        }//end if
    }

    /**
     * Join wc_product_meta_lookup to posts if not already joined.
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param string $sql SQL join.
     * @return string
     */
    private function append_product_sorting_table_join( $sql ) {
        global $wpdb;

        if ( ! strstr( $sql, 'wc_product_meta_lookup' ) ) {
            $sql .= " LEFT JOIN {$wpdb->wc_product_meta_lookup} wc_product_meta_lookup ON $wpdb->posts.ID = wc_product_meta_lookup.product_id ";
        }
        return $sql;
    }

    /**
     * Are we currently on the front page?
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param WP_Query $q Query instance.
     * @return bool
     */
    private function is_showing_page_on_front( $q ) {
        return ( $q->is_home() && ! $q->is_posts_page ) && 'page' === get_option( 'show_on_front' );
    }

    /**
     * Is the front page a page we define?
     *
     * @see \WC_Query woocommerce/includes/class-wc-query.php
     *
     * @param int $page_id Page ID.
     * @return bool
     */
    private function page_on_front_is( $page_id ) {
        return intval( get_option( 'page_on_front' ) ) === intval( $page_id );
    }

    /**
     * Checks whether we need to include features for < WC 3.6
     * Plugin Activation checks we are atleast on WC 3.5
     *
     * @return boolean
     */
    private function is_woocommerce_3_5() {
        global $woocommerce;

        return $woocommerce && version_compare( $woocommerce->version, '3.6', '<' );
    }

    /**
     * Alter the document title for the wholesale store page.
     *
     * @param array $title Current title parts.
     * @return array
     */
    public function document_title_parts( $title ) {
        if ( SupportHelper::is_wholesale_shop_page( $this->settings ) ) {
            $title['title'] = get_the_title( (int) $this->settings['general']['wholesale_store_page'] );
        }

        return $title;
    }

    /**
     * Hide pages from list_pages based on wholesale status.
     *
     * @param array $excludes
     * @return array
     */
    public function handler_list_pages( $excludes ) {
        $ywhs_excludes  = [];
        $logged_in      = false;
        $is_wholesaler  = false;
        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        if ( is_user_logged_in() ) {
            $logged_in     = true;
            $is_wholesaler = isset( $wholesale_role );

        }

        if ( ! SupportHelper::is_using_wc_shop_page( $this->settings ) ) {
            $page_id = (int) $this->settings['general']['wholesale_store_page'];
            if ( ! $logged_in ) {
                $ywhs_excludes[] = $page_id;
            }

            // if logged and NOT a wholesaler don't show wholesale store page
            if ( $logged_in && ! $is_wholesaler ) {
                $ywhs_excludes[] = $page_id;
            }

            // if logged in and a wholesaler don't show the default shop page
            if ( $logged_in && $is_wholesaler ) {
                $ywhs_excludes[] = wc_get_page_id( 'shop' );
            }
        }

        return array_unique( array_merge( $excludes, $ywhs_excludes ) );
    }

    /**
     * Handle to hide/show pages from WP menu.
     *
     * @param array $menu_items
     * @return array
     */
    public function handler_menu( $menu_items ) {
        $removed_items = [];

        $logged_in     = false;
        $is_wholesaler = false;
        $is_shop_admin = false;

        $current_user        = wp_get_current_user();
        $administrator_roles = $current_user ? array_values( array_intersect( [ 'administrator', 'shop_manager' ], $current_user->roles ) ) : [];
        $is_wholesale        = CustomerHelper::is_current_wholesale_customer();

        if ( is_user_logged_in() ) {
            $logged_in     = true;
            $is_wholesaler = $is_wholesale;
            $is_shop_admin = ! empty( $administrator_roles );
        }

        // loop through menu_items and enforce our requirements as necessary
        foreach ( $menu_items as $key => $menu_item ) {
            if ( 'page' !== $menu_item->object ) {
                continue;
            }

            if ( ! SupportHelper::is_using_wc_shop_page( $this->settings ) ) {
                $page_id = (int) $this->settings['general']['wholesale_store_page'];
                if ( ! $logged_in && (int) $menu_item->object_id === $page_id ) {
                    $removed_items[] = $menu_item->ID;
                    unset( $menu_items[ $key ] );
                }

                // if logged in and a wholesaler don't show the default shop page
                if ( $is_wholesaler && wc_get_page_id( 'shop' ) === (int) $menu_item->object_id ) {
                    $removed_items[] = $menu_item->ID;
                    unset( $menu_items[ $key ] );
                }

                if ( $logged_in && ! $is_wholesaler && ! $is_shop_admin && (int) $menu_item->object_id === $page_id ) {
                    // if logged and NOT a wholesaler or shop admin, don't show wholesale store page
                    $removed_items[] = $menu_item->ID;
                    unset( $menu_items[ $key ] );
                }
            }//end if
        }//end foreach

        // Now find and remove any children of any removed menu item
        while ( $removed_items ) {
            $child_items_removed = [];

            foreach ( $menu_items as $key => $menu_item ) {
                if ( in_array( (int) $menu_item->menu_item_parent, $removed_items, true ) ) {
                    $child_items_removed[] = $menu_item->ID;
                    unset( $menu_items[ $key ] );
                }
            }

            // Update the removed list with the removed child items and start over
            $removed_items = $child_items_removed;
        }

        return array_values( $menu_items );
    }
}
