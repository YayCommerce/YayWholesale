<?php
namespace Yay_Wholesale\Engine\Admin;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\SettingsHelper;
use Yay_Wholesale\Engine\Register\ScriptName;
use Yay_Wholesale\Helpers\RequestsHelper;

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

        add_action( 'admin_menu', [ $this, 'admin_menu' ], YAY_WHOLESALE_MENU_PRIORITY );

        add_filter( 'plugin_action_links_' . YAY_WHOLESALE_BASE_NAME, [ $this, 'add_action_links' ] );

        add_filter( 'plugin_row_meta', [ $this, 'add_document_support_links' ], 10, 2 );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );
    }

    public function admin_body_class( $classes ) {
        if ( strpos( $classes, 'yay-ui' ) === false ) {
            $classes .= ' yay-ui';
        }
        return $classes;
    }

    public function register_ywhs_request_post_type() {
        $labels                  = [
            'name'          => __( 'Wholesale Manage', 'yay-wholesale' ),
            'singular_name' => __( 'Wholesale Manage', 'yay-wholesale' ),
        ];
        $yay_wholesale_post_type = RequestsHelper::get_post_type();
        $args                    = [
            'labels'            => $labels,
            'description'       => __( 'Wholesale Manage', 'yay-wholesale' ),
            'public'            => false,
            'show_ui'           => false,
            'has_archive'       => true,
            'show_in_admin_bar' => false,
            'show_in_rest'      => true,
            'show_in_menu'      => false,
            'query_var'         => $yay_wholesale_post_type,
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

        register_post_type( $yay_wholesale_post_type, $args );
    }

    public function add_action_links( $links ) {
        $links = array_merge(
            [
                '<a href="' . esc_url( admin_url( '/admin.php?page=yay_wholesale' ) ) . '">' . __( 'Settings', 'yay-wholesale' ) . '</a>',
            ],
            $links
        );

        return $links;
    }

    public function add_document_support_links( $links, $file ) {
        if ( strpos( $file, YAY_WHOLESALE_BASE_NAME ) !== false ) {
            $new_links = [
                'doc'     => '<a href="https://yaycommerce.gitbook.io/yaywholesale/" target="_blank">' . __( 'Docs', 'yay-wholesale' ) . '</a>',
                'support' => '<a href="https://yaycommerce.com/support/" target="_blank" aria-label="' . esc_attr__( 'Visit community forums', 'yay-wholesale' ) . '">' . esc_html__( 'Support', 'yay-wholesale' ) . '</a>',
            ];
            $links     = array_merge( $links, $new_links );
        }
        return $links;
    }

    public function admin_menu() {
        $page_title = __( 'YayWholesale', 'yay-wholesale' );
        $menu_title = __( 'YayWholesale', 'yay-wholesale' );
        add_submenu_page( 'yaycommerce', $page_title, $menu_title, 'manage_woocommerce', 'yay_wholesale', [ $this, 'submenu_page_callback' ], 0 );
    }

    public function submenu_page_callback() {
        echo '<div id="yay-wholesale"></div>';
    }

    public function admin_enqueue_scripts( $hook_suffix ) {

        $allow_hook_suffixes = [ 'yaycommerce_page_yay_wholesale' ];

        if ( ! in_array( $hook_suffix, $allow_hook_suffixes ) ) {
            return;
        }

        wp_localize_script(
            ScriptName::PAGE_SETTINGS,
            'yayWholesale',
            [
                'users_url'     => esc_url_raw( admin_url( 'users.php' ) ),
                'plugin_url'    => YAY_WHOLESALE_PLUGIN_URL,
                'rest_url'      => esc_url_raw( rest_url() ),
                'rest_nonce'    => wp_create_nonce( 'wp_rest' ),
                'rest_base'     => 'yay-wholesale/v1',
                'currency_data' => [
                    'currency'     => get_woocommerce_currency(),
                    'symbol'       => get_woocommerce_currency_symbol(),
                    'position'     => get_option( 'woocommerce_currency_pos' ),
                    'thousand_sep' => get_option( 'woocommerce_price_thousand_sep' ),
                    'decimal_sep'  => get_option( 'woocommerce_price_decimal_sep' ),
                    'num_decimals' => intval( get_option( 'woocommerce_price_num_decimals' ) ),
                ],
                'settings'      => SettingsHelper::get_settings(),
                'roles'         => get_option( 'yay_wholesale_roles', [] ),
                'reviewed'      => get_option( 'yay_wholesale_reviewed', false ),
            ]
        );

        wp_enqueue_script( ScriptName::PAGE_SETTINGS );
        wp_enqueue_style( ScriptName::STYLE_SETTINGS );
    }
}
