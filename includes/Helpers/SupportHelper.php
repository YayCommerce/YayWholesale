<?php
namespace YayWholesaleB2B\Helpers;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Support Helper class
 */
class SupportHelper {

    /**
     * Get the valid pages for wholesale store setting
     *
     * @return array
     */
    public static function get_valid_pages_for_wholesale_store() {
        $exclude_ids = array_filter(
            [
                get_option( 'woocommerce_shop_page_id' ),
                get_option( 'woocommerce_cart_page_id' ),
                get_option( 'woocommerce_checkout_page_id' ),
                get_option( 'woocommerce_myaccount_page_id' ),
                get_option( 'woocommerce_terms_page_id' ),
            ]
        );

        $pages = get_posts(
            [
                'post_type'      => 'page',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'post__not_in'   => $exclude_ids,
            ]
        );

        $data = [];

        foreach ( $pages as $page ) {
            $data[] = [
                'id'    => $page->ID,
                'title' => $page->post_title,
                'slug'  => $page->post_name,
            ];
        }

        return $data;
    }

    /**
     * Check whether the current theme has a block template for the given name.
     *
     * @param  string $template_name
     * @return bool
     */
    public static function has_block_template( $template_name ) {
        if ( ! $template_name ) {
            return false;
        }

        $has_template            = false;
        $template_filename       = $template_name . '.html';
        $possible_templates_dirs = [ 'templates', 'block-templates' ];
        $possible_paths          = [];

        foreach ( $possible_templates_dirs as $template_dir ) {
            $possible_paths[] = get_stylesheet_directory() . DIRECTORY_SEPARATOR . $template_dir . DIRECTORY_SEPARATOR . $template_filename;
            $possible_paths[] = get_template_directory() . DIRECTORY_SEPARATOR . $template_dir . DIRECTORY_SEPARATOR . $template_filename;
        }

        // Check the first matching one.
        foreach ( $possible_paths as $path ) {
            if ( is_readable( $path ) ) {
                $has_template = true;
                break;
            }
        }

        return (bool) apply_filters( 'woocommerce_has_block_template', $has_template, $template_name );
    }

    /**
     * Check whether Current site is using Woocommerce shop page by default
     *
     * @param  array $setting
     * @return bool
     */
    public static function is_using_wc_shop_page( $setting ) {
        return 'inherit' === $setting['general']['wholesale_store_page'];
    }

    /**
     * Check whether current page is wholesale shop page
     *
     * @param  array $setting
     * @return bool
     */
    public static function is_wholesale_shop_page( $setting ) {
        if ( self::is_using_wc_shop_page( $setting ) && is_shop() ) {
            return true;
        }

        $page_id = (int) $setting['general']['wholesale_store_page'];

        if ( ! $page_id ) {
            return false;
        }

        return is_page( (int) $page_id );
    }

    /**
     * Get the url of wholesale shop page
     *
     * @param  array $setting
     * @return bool
     */
    public static function get_wholesale_store_url( $setting ) {
        $page = $setting['general']['wholesale_store_page'];

        if ( 'inherit' === $page ) {
            $page_id = wc_get_page_id( 'shop' );
        } else {
            $page_id = (int) $page;
        }

        if ( ! $page_id ) {
            return false;
        }

        return get_permalink( $page_id );
    }
}
