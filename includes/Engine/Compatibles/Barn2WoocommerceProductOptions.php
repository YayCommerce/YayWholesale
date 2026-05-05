<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Helpers\HooksHelper;
use YayWholesaleB2B\Utils\SingletonTrait;


defined( 'ABSPATH' ) || exit;

/**
 * Barn 2 WC Product option Compatible
 */
class Barn2WoocommerceProductOptions {
    use SingletonTrait;

    protected function __construct() {
        if ( ! function_exists( 'Barn2\Plugin\WC_Product_Options\wpo' ) ) {
            return;
        }

        add_action( 'wc_product_options_before_cart_items_calculation', [ $this, 'remove_price_hooks' ], 99, 1 );

        add_action( 'wc_product_options_after_cart_items_calculation', [ $this, 'add_price_hooks' ], 99, 1 );
    }

    public function remove_price_hooks( $cart ) {
        HooksHelper::remove_price_hooks();
        HooksHelper::remove_sale_price_hooks();
    }

    public function add_price_hooks( $cart ) {
        HooksHelper::add_price_hooks();
        HooksHelper::add_sale_price_hooks();
    }
}
