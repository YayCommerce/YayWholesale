<?php

namespace YayWholesaleB2B\Pro\Helpers;

use WP_Query;
use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * Template Helper
 */
class TemplatesHelper {
    const TAXONOMY_SLUG            = 'yay_wholesale_b2b';
    const SHOP_TEMPLATE_TERM_SLUG  = 'ywhs_shop_template';
    const SHOP_TEMPLATE_SLUG_LIST  = 'yaywholesaleb2b_shop_block_templates';
    const TEMPLATE_VISIBILITY_META = 'ywhs_template_visibility';

    public static function get_archive_product_template() {
        $template = get_block_template(
            get_stylesheet() . '//archive-product',
            'wp_template'
        );

        return $template ? $template->content : '';
    }

    public static function get_block_shop_templates_list() {
        return get_option( self::SHOP_TEMPLATE_SLUG_LIST, [] );
    }

    public static function save_block_shop_templates_list( $data ) {
        update_option( self::SHOP_TEMPLATE_SLUG_LIST, $data );
    }

    public static function get_template_visibility_meta( int $template_wp_id ) {
        return get_post_meta( $template_wp_id, self::TEMPLATE_VISIBILITY_META, true );
    }

    public static function save_template_visibility_meta( int $template_wp_id, array $meta ) {
        $wholesale_roles = RolesHelper::get_wholesale_roles();
        if ( $meta['wholesalers'] === 'enabled-selected-roles' ) {
            if ( empty( $meta['selected_roles'] ) ) {
                $meta['selected_roles'] = [];
                $meta['wholesalers']    = 'disabled';
            } elseif ( count( $meta['selected_roles'] ) === count( $wholesale_roles ) ) {
                $meta['selected_roles'] = [];
                $meta['wholesalers']    = 'enabled';
            }
        } else {
            $meta['selected_roles'] = [];
        }

        update_post_meta( $template_wp_id, self::TEMPLATE_VISIBILITY_META, $meta );
    }

    /***
     *
     * @param array|null $role the wholesale role.
     * @return string|boolean return false if there is no template.
     */
    public static function get_block_template_slug_by_role( $role ) {
        $template_slug_list = self::get_block_shop_templates_list();
        if ( empty( $template_slug_list ) ) {
            return false;
        }

        foreach ( $template_slug_list as $slug ) {
            $template_post = get_page_by_path( $slug, OBJECT, 'wp_template' );
            if ( empty( $template_post ) ) {
                continue;
            }

            $post_id = $template_post->ID;
            if ( self::is_theme_visible_to_role( $post_id, $role ) ) {
                return $slug;
            }
        }

        return false;
    }

    protected static function is_theme_visible_to_role( $post_id, $role ) {
        $visibility = self::get_template_visibility_meta( $post_id );
        if ( empty( $visibility ) ) {
            return false;
        }

        if ( ! $visibility['isActive'] ) {
            return false;
        }

        if ( empty( $role ) ) {
            return $visibility['retailers'] === 'enabled';
        }

        if ( $visibility['wholesalers'] === 'enabled-selected-roles' ) {
            return in_array( $role['slug'], $visibility['selected_roles'], true );
        }

        return $visibility['wholesalers'] === 'enabled';
    }

    public static function get_template_visibility_string( $post_id ) {
        $visibility    = self::get_template_visibility_meta( $post_id );
        $visible_roles = [];
        $active_str    = __( 'Inactive', 'yay-wholesale-b2b' );
        if ( empty( $visibility ) ) {
            return __( '( Active - Visible to All )', 'yay-wholesale-b2b' );
        }

        if ( $visibility['isActive'] ) {
            $active_str = __( 'Active', 'yay-wholesale-b2b' );
        }

        if ( $visibility['retailers'] === 'enabled' ) {
            $visible_roles[] = __( 'Retailers', 'yay-wholesale-b2b' );
        }

        if ( $visibility['wholesalers'] === 'enabled' ) {
            if ( $visibility['retailers'] === 'enabled' ) {
                $visible_roles = [ __( 'All', 'yay-wholesale-b2b' ) ];
            } else {
                $visible_roles[] = __( 'Wholesalers', 'yay-wholesale-b2b' );
            }
        } elseif ( $visibility['wholesalers'] === 'enabled-selected-roles' ) {
            $roles         = RolesHelper::get_wholesale_roles();
            $roles_name    = array_column( array_filter( $roles, fn( $value ) => ( in_array( $value['slug'], $visibility['selected_roles'], true ) ) ), 'name' );
            $visible_roles = array_merge( $visible_roles, $roles_name );
        }

        $visible_str = implode( ', ', $visible_roles );
        // translators: %1$s: the active status, %2$s: the visible roles
        $final_str = sprintf( __( '( %1$s - Visible to %2$s )', 'yay-wholesale-b2b' ), $active_str, empty( $visible_str ) ? __( 'None', 'yay-wholesale-b2b' ) : $visible_str );
        return $final_str;
    }

    public static function get_template_name() {
        $base_name = 'B2C / B2B Product Catalog';

        global $wpdb;

        // Get existing titles that start with the base name
        $existing_titles = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT post_title
                 FROM {$wpdb->posts}
                 WHERE post_type = 'wp_template'
                   AND post_title LIKE %s
                   AND post_status != 'trash'",
                $wpdb->esc_like( $base_name ) . '%'
            )
        );

        if ( empty( $existing_titles ) ) {
            return $base_name;
        }

        $existing = array_flip( $existing_titles );
        // Fast lookup

        $counter = 1;
        while ( true ) {
            $candidate = $base_name . ' ' . ( $counter++ );
            if ( ! isset( $existing[ $candidate ] ) ) {
                return $candidate;
            }
        }
    }

    public static function is_requirement_enabled_in_cart() {
        if ( ! is_cart() ) {
            return true;
        }

        // Theme uses setting from template (Brandy)
        $template        = get_block_template( get_stylesheet() . '//' . get_page_template_slug(), 'wp_template' );
        $template_blocks = [];
        if ( $template ) {
            $template_blocks = parse_blocks( $template->content );
        }

        // Theme uses setting from page edit (2025)
        $page = get_post();
        if ( ! $page ) {
            return false;
        }

        $page_blocks = parse_blocks( $page->post_content );
        $blocks      = array_merge( $page_blocks, $template_blocks );

        $queue = $blocks;
        while ( ! empty( $queue ) ) {
            $block = array_shift( $queue );
            if (
                in_array( $block['blockName'], [ 'woocommerce/cart' ], true )
                && ! empty( $block['attrs']['requirementBarEnabled'] )
                ) {
                    return $block['attrs']['requirementBarEnabled'];
            }
            array_push( $queue, ...$block['innerBlocks'] );
        }

        return false;
    }
}
