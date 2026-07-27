<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\SupportHelper;
use YayWholesaleB2B\Helpers\TemplatesHelper as ClassicTemplatesHelper;
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
        add_filter( 'template_include', [ $this, 'replace_templates_classic' ], 999, 1 );
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
        if ( empty( $slug ) ) {
            return $templates;
        }

        $new_template = get_block_template(
            get_stylesheet() . '//' . $slug,
            'wp_template'
        );

        if ( empty( $new_template ) ) {
            return $templates;
        }

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
        if ( empty( $slug ) ) {
            return $templates;
        }

        return array_merge( [ $slug ], $templates );
    }

    public function replace_templates_classic( $template ) {
        if ( wp_is_block_theme() ) {
            return $template;
        }

        $shop_display = get_option( 'woocommerce_shop_page_display', 'products' );
        // shop page: Show when in normal display mode (products, products and categories), hide when in categories display mode
        // product category page : Always show for this page
        if ( ( ! is_shop() || ( $shop_display && $shop_display === 'subcategories' ) ) && ! is_product_category() ) {
            return $template;
        }

        if ( wc_current_theme_supports_woocommerce_or_fse() ) {
            $shop_template_list = ClassicTemplatesHelper::get_full_classic_templates();
            if ( count( $shop_template_list ) <= 1 ) {
                return $template;
            }
            $template_settings = TemplatesHelper::get_classic_templates_setting();
            $key               = CustomerHelper::is_current_wholesale_customer() ? 'wholesalers' : 'retailers';

            if ( ! isset( $template_settings[ $key ] ) || $template_settings[ $key ] === 'wc' ) {
                return $template;
            }

            $full_template = array_first(
                array_filter(
                    $shop_template_list,
                    fn( $t ) => $t['slug'] === $template_settings[ $key ]
                )
            );

            if ( ! empty( $full_template['path'] ) ) {
                return $full_template['path'];
            } else {
                return $template;
            }
        } else {
            add_filter( 'the_content', [ $this, 'shop_template_content' ] );
        }//end if
    }

    /**
     * Handle the content of page to add the products shortcode to the page's content (if Woocommerce is not supported)
     *
     * @param   string $content
     * @return  string
     */
    public function shop_template_content( $content ) {
        if ( wc_current_theme_supports_woocommerce_or_fse() || ! is_main_query() || ! in_the_loop() ) {
            return $content;
        }

        remove_filter( 'the_content', [ $this, 'shop_template_content' ] );

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

        $content = $shortcode->get_content();

        WC()->query->remove_ordering_args();

        return $content;
    }
}
