<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Engine\Register\ScriptName;
use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Services\LocalizeService;
use YayWholesaleB2B\Utils\Utils;

defined( 'ABSPATH' ) || exit;
/**
 * Settings Page
 */
class Settings {
    use SingletonTrait;

    private LocalizeService $localize_service;

    protected function __construct() {
        $this->localize_service = LocalizeService::get_instance();

        add_filter( 'admin_body_class', [ $this, 'admin_body_class' ] );

        // Register Custom Post Type
        add_action( 'init', [ $this, 'register_ywhs_request_post_type' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_admin_styles' ] );

        add_filter( 'ywhs_product_price_ajax_handled', [ $this, 'default_value_for_product_price' ], 10, 1 );
    }

    public function admin_body_class( $classes ) {
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

    public function admin_enqueue_scripts( $hook_suffix ) {

        $allow_hook_suffixes = [ 'yaycommerce_page_yay_wholesale_b2b' ];

        if ( ! in_array( $hook_suffix, $allow_hook_suffixes ) ) {
            return;
        }

        wp_localize_script(
            ScriptName::PAGE_SETTINGS,
            LocalizeService::VAR_ADMIN,
            $this->localize_service->get_admin_data(),
        );

        wp_localize_script(
            ScriptName::PAGE_SETTINGS,
            LocalizeService::VAR_META,
            $this->localize_service->get_meta(),
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
