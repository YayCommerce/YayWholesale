<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\LocalizeHelper;
use YayWholesaleB2B\Engine\Register\ScriptName;
use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Utils\Utils;

defined( 'ABSPATH' ) || exit;
/**
 * Settings Page
 */
class Settings {
    use SingletonTrait;

    protected function __construct() {

        add_filter( 'admin_body_class', [ $this, 'admin_body_class' ] );

        // Register Custom Post Type
        add_action( 'init', [ $this, 'register_ywhs_request_post_type' ] );

        add_action( 'admin_menu', [ $this, 'admin_menu' ], YAYWHOLESALEB2B_MENU_PRIORITY );

        add_filter( 'plugin_action_links_' . YAYWHOLESALEB2B_BASE_NAME, [ $this, 'add_action_links' ] );

        add_filter( 'plugin_row_meta', [ $this, 'add_document_support_links' ], 10, 2 );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_admin_styles' ] );

        add_action( 'ywhs_product_price_ajax_handled', [ $this, 'default_value_for_product_price' ], 10, 1 );
    }

    public function admin_body_class( string $classes ): string {
        if ( strpos( $classes, 'yay-ui' ) === false ) {
            $classes .= ' yay-ui';
        }
        return $classes;
    }

    public function register_ywhs_request_post_type() {
        $labels         = [
            'name'          => __( 'Wholesale Manage', 'yay-wholesale-b2b' ),
            'singular_name' => __( 'Wholesale Manage', 'yay-wholesale-b2b' ),
        ];
        $ywhs_post_type = RequestsHelper::REQUEST_POST_TYPE;
        $args           = [
            'labels'            => $labels,
            'description'       => __( 'Wholesale Manage', 'yay-wholesale-b2b' ),
            'public'            => false,
            'show_ui'           => false,
            'has_archive'       => true,
            'show_in_admin_bar' => false,
            'show_in_rest'      => true,
            'show_in_menu'      => false,
            'query_var'         => $ywhs_post_type,
            'supports'          => [
                'title',
                'thumbnail',
            ],
            'capabilities'      => [
                'edit_post'          => 'manage_options',
                'read_post'          => 'manage_options',
                'delete_post'        => 'manage_options',
                'edit_posts'         => 'manage_options',
                'edit_others_posts'  => 'manage_options',
                'delete_posts'       => 'manage_options',
                'publish_posts'      => 'manage_options',
                'read_private_posts' => 'manage_options',
            ],
        ];

        register_post_type( $ywhs_post_type, $args );
    }

    public function add_action_links( $links ) {
        $action_links = [
            '<a href="' . esc_url( admin_url( '/admin.php?page=yay_wholesale' ) ) . '">' . __( 'Settings', 'yay-wholesale-b2b' ) . '</a>',
        ];
        if ( ! Utils::is_pro() ) {
            $links[] = '<a target="_blank" href="https://yaycommerce.com/yay-wholesale-b2b-for-woocommerce/" style="color: #43B854; font-weight: bold">' . __( 'Go Pro', 'yay-wholesale-b2b' ) . '</a>';
        }

        return array_merge( $action_links, $links );
    }

    public function add_document_support_links( $links, $file ) {
        if ( strpos( $file, YAYWHOLESALEB2B_BASE_NAME ) !== false ) {
            $new_links = [
                'doc'     => '<a href="https://yaycommerce.com/ " target="_blank">' . __( 'Docs', 'yay-wholesale-b2b' ) . '</a>',
                'support' => '<a href="https://yaycommerce.com/support/" target="_blank" aria-label="' . esc_attr__( 'Visit community forums', 'yay-wholesale-b2b' ) . '">' . esc_html__( 'Support', 'yay-wholesale-b2b' ) . '</a>',
            ];
            $links     = array_merge( $links, $new_links );
        }
        return $links;
    }

    public function admin_menu() {
        $page_title = __( 'YayWholesale', 'yay-wholesale-b2b' );
        $menu_title = __( 'YayWholesale', 'yay-wholesale-b2b' );
        add_submenu_page( 'yaycommerce', $page_title, $menu_title, 'manage_woocommerce', 'yay_wholesale', [ $this, 'submenu_page_callback' ], 0 );
    }

    public function submenu_page_callback() {
        echo '<div id="yay-wholesale-b2b"></div>';
    }

    public function admin_enqueue_scripts( string $hook_suffix ) {

        $allow_hook_suffixes = [ 'yaycommerce_page_yay_wholesale' ];

        if ( ! in_array( $hook_suffix, $allow_hook_suffixes, true ) ) {
            return;
        }

        wp_localize_script(
            ScriptName::PAGE_SETTINGS,
            LocalizeHelper::VAR_ADMIN,
            LocalizeHelper::get_admin_data(),
        );

        wp_localize_script(
            ScriptName::PAGE_SETTINGS,
            LocalizeHelper::VAR_META,
            LocalizeHelper::get_meta(),
        );

        wp_enqueue_script( ScriptName::PAGE_SETTINGS );
        wp_enqueue_style( ScriptName::STYLE_SETTINGS );
    }

    public function admin_enqueue_admin_styles() {
        wp_enqueue_style( 'yay-wholesale-admin-styles', YAYWHOLESALEB2B_PLUGIN_URL . 'assets/css/admin_styles.css', [], YAYWHOLESALEB2B_VERSION );
    }

    public function default_value_for_product_price( $price ) {
        return $price;
    }
}
