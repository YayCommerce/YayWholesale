<?php

namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Engine\Frontend\Pricing;

/**
 * Common Helper
 */
class HooksHelper {

    public static function remove_price_hooks() {
        remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
        remove_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
        remove_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
    }

    public static function add_price_hooks() {
        add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
        add_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
        add_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'ywhs_get_price' ], 999, 2 );
    }


    public static function remove_sale_price_hooks() {
        remove_filter( 'woocommerce_product_get_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
        remove_filter( 'woocommerce_product_variation_get_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
        remove_filter( 'woocommerce_variation_prices_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
    }

    public static function add_sale_price_hooks() {
        add_filter( 'woocommerce_product_get_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
        add_filter( 'woocommerce_product_variation_get_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
        add_filter( 'woocommerce_variation_prices_sale_price', [ Pricing::get_instance(), 'ywhs_get_sale_price' ], 999, 2 );
    }
}
