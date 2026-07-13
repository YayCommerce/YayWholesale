<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\LocalizeHelper;
use YayWholesaleB2B\Engine\Register\ScriptName;
use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Helpers\SetupWizardHelper;

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

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_admin_styles' ] );

        add_action( 'admin_enqueue_scripts', [ $this, 'admin_enqueue_general_admin_behaviors' ] );

        add_action( 'current_screen', [ $this, 'admin_redirect_to_setup_wizard' ] );
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

    public function admin_enqueue_scripts( $hook_suffix ) {

        $allow_hook_suffixes = [ 'yaycommerce_page_yay_wholesale_b2b' ];

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

    public function admin_enqueue_general_admin_behaviors() {
        wp_enqueue_script( 'yay-wholesale-general-admin-behaviors', YAYWHOLESALEB2B_PLUGIN_URL . 'assets/js/admin_scripts.js', [ 'jquery', 'wp-i18n' ], YAYWHOLESALEB2B_VERSION, true );
    }

    public function admin_redirect_to_setup_wizard( \WP_Screen $current_screen ) {
        if ( get_transient( SetupWizardHelper::SETUP_WIZARD_REDIRECT_TRANSIENT ) ) {
            // After plugin activation, redirect to setup wizard if not completed
            delete_transient( SetupWizardHelper::SETUP_WIZARD_REDIRECT_TRANSIENT );
            if ( 'fresh' === SetupWizardHelper::get_setup_wizard_status() ) {
                SetupWizardHelper::redirect_to_setup_wizard();
                return;
            }
        }
    }
}
