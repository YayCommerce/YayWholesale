<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Pro\Helpers\TemplatesHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Template Editor Engine.
 */
class TemplateEditor {
    use SingletonTrait;

    protected function __construct() {
        // add_action( 'init', [ $this, 'register_templates' ] );

        add_action( 'init', [ $this, 'register_taxonomy' ], 10, 0 );
        // add_filter( 'register_block_type_args', [ $this, 'my_plugin_add_cart_toggle' ], 10, 2 );
        // add_action( 'enqueue_block_editor_assets', [ $this, 'add_custom_attrs' ] );

        // When Saving a template
        add_action( 'save_post_wp_template', [ $this, 'save_shop_template' ], 10, 3 );
        // When Deleting a template
        add_action( 'before_delete_post', [ $this, 'before_delete_shop_template' ], 10, 1 );
    }

    public function register_templates() {
        if ( ! function_exists( 'register_block_template' ) ) {
            return;
        }
        // Retail Shop Template
        \register_block_template(
            'yay-wholesale-b2b//ywhs-retail-shop',
            [
                'title'       => __( 'Retail Shop', 'yay-wholesale-b2b' ),
                'description' => __( 'Retail shop template', 'yay-wholesale-b2b' ),
                'content'     => TemplatesHelper::get_archive_product_template(),
                'post_types'  => [ 'product' ],
            ]
        );

        // Wholesale Shop Template
        \register_block_template(
            'yay-wholesale-b2b//ywhs-wholesale-shop',
            [
                'title'       => __( 'Wholesale Shop', 'yay-wholesale-b2b' ),
                'description' => __( 'Wholesale / B2B shop template', 'yay-wholesale-b2b' ),
                'content'     => TemplatesHelper::get_archive_product_template(),
            ]
        );
    }

    public function my_plugin_add_cart_toggle( $args, $block_type ) {
        if ( $block_type === 'woocommerce/cart' ) {
            if ( empty( $args['attributes'] ) ) {
                $args['attributes'] = [];
            }

            $args['attributes']['requirementBarEnabled'] = [
                'type'    => 'boolean',
                'default' => false,
            ];
        }
        return $args;
    }

    public function add_custom_attrs() {
        $asset = include YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/pro/dist/requirement-bar-attribute-editor/index.asset.php';
        wp_enqueue_script(
            'ywhs_requirement_attibute_editor',
            YAYWHOLESALEB2B_PLUGIN_URL . 'assets/pro/dist/requirement-bar-attribute-editor/index.js',
            $asset['dependencies'],
            YAYWHOLESALEB2B_VERSION,
            true
        );
    }

    /**
     * Register new Taxonomy for WPT Setting.
     *
     * @return void
     */
    public function register_taxonomy() {
        if ( ! taxonomy_exists( TemplatesHelper::TAXONOMY_SLUG ) ) {
            $args = [
                'labels'            => [
                    'name'          => __( 'Yay Wholesale B2B terms', 'yay-wholesale-b2b' ),
                    'singular_name' => __( 'Yay Wholesale B2B term', 'yay-wholesale-b2b' ),
                    'template_name' => _x( 'Products by Wholesale', 'Template name', 'yay-wholesale-b2b' ),
                    'all'           => __( 'Product Catalog', 'yay-wholesale-b2b' ),
                ],
                'hierarchical'      => false,
                'public'            => true,
                'show_ui'           => false,
                'show_admin_column' => false,
                'show_in_menu'      => false,
                'show_in_nav_menus' => false,
                'show_in_rest'      => true,
                'query_var'         => true,
                'rewrite'           => [ 'slug' => 'yay-wholesale-b2b' ],
                'capabilities'      => [
                    'manage_terms' => 'manage_woocommerce',
                    'edit_terms'   => 'manage_woocommerce',
                    'delete_terms' => 'manage_woocommerce',
                    'assign_terms' => 'edit_products',
                ],
            ];
            register_taxonomy( TemplatesHelper::TAXONOMY_SLUG, 'product', $args );
        }//end if

        if ( ! term_exists( TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG, TemplatesHelper::TAXONOMY_SLUG ) ) {
            wp_insert_term(
                'Product by Wholesale Roles Template',
                TemplatesHelper::TAXONOMY_SLUG,
                [
                    'slug'        => TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG,
                    'description' => 'Automatically generated term for B2C / B2B shop templates.',
                ]
            );
        }
    }

    public function save_shop_template( $post_id, $post, $update ) {
        if ( $update ) {
            return;
        }
        $taxonomy = 'yay_wholesale_b2b';

        $taxonomy_map = explode( '-', $post->post_name );
        // format: taxonomy-yay_wholesale_b2b-[term_slug];
        if ( $taxonomy_map[0] !== 'taxonomy' || $taxonomy_map[1] !== $taxonomy ) {
            return;
        }

        if ( $taxonomy_map[2] ) {
            $term_slug = $taxonomy_map[2];
        } else {
            $term_slug = TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG;
        }

        $term = term_exists( $term_slug, $taxonomy );
        if ( ! $term ) {
            return;
        }

        wp_set_object_terms( $post_id, $term_slug, $taxonomy, false );
        $template_slugs = TemplatesHelper::get_block_shop_templates_list();

        // Remove action to prevent loop
        remove_action( 'save_post_wp_template', [ $this, 'save_shop_template' ] );

        $unique_key = substr( str_replace( '-', '', wp_generate_uuid4() ), 0, 8 );

        // Get fresh post data
        $slug = sanitize_title( 'yaywholesale_template_' . $unique_key );

        wp_update_post(
            [
                'ID'           => $post_id,
                'post_content' => TemplatesHelper::get_archive_product_template(),
                'post_status'  => 'publish',
                'post_name'    => $slug,
                // translators: %d: index of new template
                'post_title'   => sprintf( __( 'B2C / B2B Product Catalog %d', 'yay-wholesale-b2b' ), ( count( $template_slugs ) + 1 ) ),
                'post_excerpt' => __( 'This customizable template allows you to tailor the shop experience for retailers and specific wholesalers.', 'yay-wholesale-b2b' ),
            ]
        );

        if ( ! in_array( $slug, $template_slugs, true ) ) {
            $template_slugs[] = $slug;
            TemplatesHelper::save_block_shop_templates_list( $template_slugs );
        }

        // Re-add the hook
        add_action( 'save_post_wp_template', [ $this, 'save_shop_template' ], 10, 3 );
    }

    public function before_delete_shop_template( $post_id ) {
        $terms = wp_get_object_terms( $post_id, TemplatesHelper::TAXONOMY_SLUG );
        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            return;
        }

        $template_slugs = TemplatesHelper::get_block_shop_templates_list();
        $post           = get_post( $post_id );

        foreach ( $terms as $term ) {
            if ( $term->slug === TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG ) {
                $template_slugs = array_filter( $template_slugs, fn( $slug ) => $slug != $post->post_name );
                TemplatesHelper::save_block_shop_templates_list( $template_slugs );
                break;
            }
        }
    }
}
