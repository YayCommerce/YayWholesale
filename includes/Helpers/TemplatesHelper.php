<?php

namespace YayWholesaleB2B\Helpers;

/**
 * Get Woocommerce configurations
 */
class TemplatesHelper {

    public static function get_classic_templates() {
        $templates = self::get_full_classic_templates();

        return array_map(
            fn( $item ) => [
                'slug' => $item['slug'],
                'name' => $item['name'],
            ],
            $templates
        );
    }

    public static function get_full_classic_templates() {
        return apply_filters(
            'ywhs_classic_shop_template_list',
            [
                [
                    'slug' => 'wc',
                    'name' => __( 'Woocommerce Template', 'yay-wholesale-b2b' ),
                    'path' => '',
                ],
            ]
        );
    }
}
