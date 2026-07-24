<?php
namespace YayWholesaleB2B\Pro\Engine\Admin;

use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Pro\Helpers\TemplatesHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Template Editor Engine.
 */
class TemplateEditor {
    use SingletonTrait;

    protected function __construct() {
        // Init register: taxonomy, rest fields
        add_action( 'init', [ $this, 'register_taxonomy' ], 10, 0 );
        add_action( 'init', [ $this, 'register_rest_fields' ], 10, 0 );

        // Add a Custom Template setting sidebar
        add_action( 'enqueue_block_editor_assets', [ $this, 'add_custom_attrs' ] );
        // When create a template
        add_action( 'save_post_wp_template', [ $this, 'create_shop_template' ], 20, 3 );
        // When update a template
        add_action( 'wp_after_insert_post', [ $this, 'update_shop_template' ], 20, 2 );
        // When deleting a single template
        add_action( 'before_delete_post', [ $this, 'before_delete_shop_template' ], 10, 2 );

        // Others
        add_filter( 'register_block_type_args', [ $this, 'my_plugin_add_cart_toggle' ], 10, 2 );

        // Classic (Yay Wholesale settings)
        add_filter( 'ywhs_full_settings', [ $this, 'get_template_list' ], 10, 1 );
        add_action( 'ywhs_settings_updated', [ $this, 'update_template_list' ], 10, 1 );
        add_filter( 'ywhs_is_using_custom_templates', '__return_true', 10, 1 );
    }

    /**
     * Register Requirement toggle attribute to the cart template
     *
     * @param array  $args the block's arguments.
     * @param string $block_type The block type.
     * @return array
     */
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

    /**
     * Enqueue the JS component to the template editor
     *
     * @return void
     */
    public function add_custom_attrs() {
        $handle = 'ywhs_template_editor';
        $asset  = include YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/pro/dist/template-editor/index.asset.php';
        wp_enqueue_script(
            $handle,
            YAYWHOLESALEB2B_PLUGIN_URL . 'assets/pro/dist/template-editor/index.js',
            $asset['dependencies'],
            YAYWHOLESALEB2B_VERSION,
            true
        );

        wp_localize_script(
            $handle,
            'yayWholesaleMeta',
            [
                'wholesale_roles'        => RolesHelper::get_wholesale_roles(),
                'is_requirement_visible' => RequirementHelper::is_requirement_bar_visible() && class_exists( 'Automattic\WooCommerce\Blocks\Package' ),
            ]
        );
    }

    /**
     * Register the main taxonomy for plugin and add new instance standing for YayWholesale Shop Template.
     *
     * @return void
     */
    public function register_taxonomy() {
        if ( ! taxonomy_exists( TemplatesHelper::TAXONOMY_SLUG ) ) {
            $args = [
                'labels'            => [
                    'name'          => __( 'Products By Wholesale Role', 'yay-wholesale-b2b' ),
                    'singular_name' => __( 'Yay Wholesale B2B Templates', 'yay-wholesale-b2b' ),
                    'template_name' => _x( 'Products by Wholesale', 'Template name', 'yay-wholesale-b2b' ),
                ],
                'hierarchical'      => false,
                'public'            => true,
                'show_ui'           => false,
                'show_admin_column' => false,
                'show_in_menu'      => false,
                'show_in_nav_menus' => false,
                'show_in_rest'      => true,
                'query_var'         => true,
                'rewrite'           => [ 'slug' => TemplatesHelper::TAXONOMY_SLUG ],
                'capabilities'      => [
                    'manage_terms' => 'manage_woocommerce',
                    'edit_terms'   => 'manage_woocommerce',
                    'delete_terms' => 'manage_woocommerce',
                    'assign_terms' => 'edit_products',
                ],
            ];
            register_taxonomy( TemplatesHelper::TAXONOMY_SLUG, [ 'wp_template', 'wp_template_part' ], $args );
        }//end if

        if ( ! term_exists( TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG, TemplatesHelper::TAXONOMY_SLUG ) ) {
            wp_insert_term(
                'Products by Wholesale Roles Template',
                TemplatesHelper::TAXONOMY_SLUG,
                [
                    'slug'        => TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG,
                    'description' => 'Automatically generated term for B2C / B2B shop templates.',
                ]
            );
        }
    }

    /**
     * Register the rest fields for Block Editor.
     *
     * @return void
     */
    public function register_rest_fields() {
        register_rest_field(
            'wp_template',
            'ywhs_taxonomies',
            [
                'get_callback' => function ( $template ) {
                    return wp_get_post_terms(
                        $template['wp_id'],
                        TemplatesHelper::TAXONOMY_SLUG,
                    );
                },
                'schema'       => [
                    'description' => 'Wholesale template taxonomy terms',
                    'type'        => 'array',
                    'items'       => [
                        'type' => 'object',
                    ],
                ],
            ]
        );

        register_rest_field(
            'wp_template',
            'ywhs_meta',
            [
                'get_callback'    => function ( $template ) {
                    $post_id = $template['wp_id'];

                    return [
                        TemplatesHelper::TEMPLATE_VISIBILITY_META => TemplatesHelper::get_template_visibility_meta( $post_id ),
                    ];
                },

                'update_callback' => function ( $meta_list, $template ) {
                    foreach ( $meta_list as $key => $meta ) {
                        if ( $key === 'ywhs_template_visibility' ) {
                            TemplatesHelper::save_template_visibility_meta( $template->wp_id, $meta );
                        }
                    }
                },
            ]
        );
    }

    /**
     * Change the template properties (content, title, name, ... ) when created one
     *
     * @param int      $post_id The post id (WP_ID).
     * @param \WP_Post $post The post of template.
     * @param boolean  $update true if updating the post, false if creating the post.
     * @return void
     */
    public function create_shop_template( $post_id, \WP_Post $post, $update ) {
        if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
            return;
        }
        // Remove action to prevent loop
        if ( $update ) {
            return;
        }

        $taxonomy = TemplatesHelper::TAXONOMY_SLUG;

        // format: taxonomy-yay_wholesale_b2b-[term_slug];
        $taxonomy_map = explode( '-', $post->post_name );
        if ( $taxonomy_map[0] !== 'taxonomy' || $taxonomy_map[1] !== $taxonomy ) {
            return;
        }

        if ( array_key_exists( 2, $taxonomy_map ) ) {
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
        remove_action( 'save_post_wp_template', [ $this, 'create_shop_template' ] );

        $unique_key = substr( str_replace( '-', '', wp_generate_uuid4() ), 0, 8 );

        // Get fresh post data
        $slug = sanitize_title( 'yaywholesaleb2b_template_' . $unique_key );

        wp_update_post(
            [
                'ID'           => $post_id,
                'post_content' => TemplatesHelper::get_archive_product_template(),
                'post_status'  => 'publish',
                'post_name'    => $slug,
                'post_title'   => TemplatesHelper::get_template_name(),
            ]
        );

        if ( ! in_array( $slug, $template_slugs, true ) ) {
            $template_slugs[ get_stylesheet() ][] = $slug;
            TemplatesHelper::save_block_shop_templates_list( $template_slugs );
        }

        TemplatesHelper::save_template_visibility_meta( $post_id, TemplatesHelper::get_default_template_visibility_meta() );

        // Re-add the hook
        add_action( 'save_post_wp_template', [ $this, 'create_shop_template' ], 10, 3 );
    }

    /**
     * Update the template list when delete / bulk delete templates
     *
     * @param int      $post_id The post id (WP_ID).
     * @param \WP_Post $post The post of template.
     * @return void
     */
    public function before_delete_shop_template( $post_id, $post ) {
        $terms = wp_get_object_terms( $post_id, TemplatesHelper::TAXONOMY_SLUG );
        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            return;
        }

        // Delete the cache option when bulk delete templates
        wp_cache_delete( TemplatesHelper::SHOP_TEMPLATE_SLUG_LIST, 'options' );
        wp_cache_delete( 'alloptions', 'options' );

        $templates = TemplatesHelper::get_block_shop_templates_list();

        foreach ( $terms as $term ) {
            if ( $term->slug === TemplatesHelper::SHOP_TEMPLATE_TERM_SLUG ) {
                $templates[ get_stylesheet() ] = array_filter( $templates[ get_stylesheet() ], fn( $slug ) => $slug !== $post->post_name );
                TemplatesHelper::save_block_shop_templates_list( $templates );
                break;
            }
        }
    }

    /**
     * Change the template properties - post exerpt when create / update one
     *
     * @param int      $post_id The post id (WP_ID).
     * @param \WP_Post $post The post of template.
     * @return void
     */
    public function update_shop_template( $post_id, $post ) {
        if ( $post->post_type !== 'wp_template' ) {
            return;
        }

        $terms = wp_get_object_terms( $post_id, TemplatesHelper::TAXONOMY_SLUG );
        if ( is_wp_error( $terms ) || empty( $terms ) ) {
            return;
        }

        remove_action( 'wp_after_insert_post', [ $this, 'update_shop_template' ] );
        wp_update_post(
            [
                'ID'           => $post_id,
                'post_excerpt' => __( 'This customizable template allows you to tailor the shop experience for retailers and specific wholesalers.', 'yay-wholesale-b2b' )
                . ' ' . TemplatesHelper::get_template_visibility_string( $post_id ),
            ],
            true,
            false
        );
        // Re-add the hook
        add_action( 'wp_after_insert_post', [ $this, 'update_shop_template' ], 20, 2 );
    }

    public function get_template_list( array $settings ) {
        $classic_templates_setting                          = TemplatesHelper::get_classic_templates_setting();
        $settings['display']['classic_retailer_template']   = $classic_templates_setting['retailers'];
        $settings['display']['classic_wholesaler_template'] = $classic_templates_setting['wholesalers'];
        return $settings;
    }

    public function update_template_list( array $settings ) {
        $classic_templates_setting = [
            'retailers'   => $settings['display']['classic_retailer_template'],
            'wholesalers' => $settings['display']['classic_wholesaler_template'],
        ];
        TemplatesHelper::save_classic_templates_setting( $classic_templates_setting );
    }
}
