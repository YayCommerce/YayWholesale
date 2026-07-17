<?php

namespace YayWholesaleB2B\Pro\Helpers;

/**
 * Template Helper
 */
class TemplatesHelper {
    const TAXONOMY_SLUG           = 'yay_wholesale_b2b';
    const SHOP_TEMPLATE_TERM_SLUG = 'ywhs_shop_template';
    const SHOP_TEMPLATE_SLUG_LIST = 'yaywholesaleb2b_shop_block_templates';

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
