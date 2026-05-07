<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\PricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Pricing Engine
 */
class Pricing {
    use SingletonTrait;

    protected $settings;

    protected function __construct() {
        $this->settings = SettingsHelper::get_settings();

        // --- WooCommerce hooks ---
        // add_filter( 'woocommerce_get_variation_prices_hash', [ $this, 'ywhs_variation_prices_hash' ], 99, 1 );

        add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );

        add_action( 'woocommerce_before_calculate_totals', [ $this, 'before_calculate_totals' ], 103 );

        add_filter( 'woocommerce_cart_item_price', [ $this, 'cart_item_price' ], 999, 2 );

        add_action( 'woocommerce_checkout_order_processed', [ $this, 'ywhs_checkout_wholesale_order_handling' ], 999, 3 );
    }

    /**
     * Update the wholesale price in cart / checkout
     *
     * @param \WC_Cart $cart The hash array.
     */
    public function before_calculate_totals( $cart ) {
        if ( did_action( 'woocommerce_before_calculate_totals' ) > 1 ) {
            return;
        }

        do_action( 'ywhs_before_cart_calculate_totals', $cart );
        foreach ( $cart->get_cart_contents() as $cart_item_key => $cart_item ) {
            if ( ! empty( $cart_item['data'] ) ) {
                do_action( 'ywhs_before_cart_item_calculate_totals', $cart );

                $product = $cart_item['data'];

                $price = $product->get_price();

                $maybe_discounted_price = PricingHelper::apply_wholesale_discount( $price, $product, false );

                $product->set_price( $maybe_discounted_price );

                do_action( 'ywhs_after_cart_item_calculate_totals', $cart );
            }//end if
        }//end foreach

        do_action( 'ywhs_after_cart_calculate_totals', $cart );
    }

    /**
     * Update price display in mini-cart
     *
     * @param string $price_html The hash array.
     * @param array  $cart_item the cart item.
     * @return string
     */
    public function cart_item_price( $price_html, $cart_item ) {
        if ( empty( $cart_item['data'] ) ) {
            return $price_html;
        }

        $product = $cart_item['data'];

        $regular = (float) $product->get_regular_price();
        $sale    = (float) $product->get_sale_price();

        $discounted = PricingHelper::apply_wholesale_discount( $sale > 0 ? $sale : $regular, $product, true );

        $tax_display_shop = get_option( 'woocommerce_tax_display_cart', 'excl' );

        if ( 'incl' === $tax_display_shop ) {
            $regular    = wc_get_price_including_tax( $product, [ 'price' => $regular ] );
            $discounted = wc_get_price_including_tax( $product, [ 'price' => $discounted ] );
        } else {
            $regular    = wc_get_price_excluding_tax( $product, [ 'price' => $regular ] );
            $discounted = wc_get_price_excluding_tax( $product, [ 'price' => $discounted ] );
        }

        if ( $discounted < $regular ) {
            return sprintf(
                '<del aria-hidden="true">%s</del> <ins>%s</ins>',
                wc_price( $regular ),
                wc_price( $discounted )
            );
        }

        // Normal price
        return $price_html;
    }

    /**
     * Get the variation prices hash
     *
     * @param array $hash The hash array.
     * @return array The variation prices hash.
     */
    public function ywhs_variation_prices_hash( array $hash ): array {
        $role = CustomerHelper::get_current_user_wholesale_role();
        if ( $role ) {
            $hash[] = $role['slug'];
        }
        $hash[] = $this->settings['display']['price_format'] ?? '';
        return $hash;
    }

    /**
     * Display the wholesale price HTML
     *
     * @param string      $price_html The price HTML.
     * @param \WC_Product $product The product object.
     * @return string The displayed HTML.
     */
    public function ywhs_display_wholesale_price_html( string $price_html, \WC_Product $product ): string {

        $show_to_all  = $this->settings['general']['show_wholesale_price'] ?? false;
        $display_mode = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';
        $is_logged_in = is_user_logged_in();
        $role         = CustomerHelper::get_current_user_wholesale_role();
        $is_wholesale = ! empty( $role );

        // If not logged in and not showing to all, or logged in and not wholesale and not showing to all
        if ( ( ! $is_logged_in && ! $show_to_all ) || ( $is_logged_in && ! $is_wholesale && ! $show_to_all ) ) {
            return $price_html;
        }

        // If variable product
        if ( $product->is_type( 'variable' ) ) {
            return $this->format_variable_wholesale_price_html( $product );
        }

        // If simple product
        switch ( $display_mode ) {
            case 'wholesale-only':
                return $this->format_wholesale_only_price_html( $product );
            case 'retail-only':
                return $this->format_retail_only_price_html( $product );
            case 'retail-and-wholesale':
            default:
                return $this->format_retail_and_wholesale_price_html( $product );
        }
    }

    /**
     * Format the retail only price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_retail_only_price_html( \WC_Product $product ): string {
        $regular = (float) $product->get_regular_price();
        $sale    = (float) $product->get_sale_price();

        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );
        if ( 'incl' === $tax_display_shop ) {
            $regular_to_show = wc_get_price_including_tax( $product, [ 'price' => $regular ] );
            $sale_to_show    = wc_get_price_including_tax( $product, [ 'price' => $sale ] );
        } else {
            $regular_to_show = wc_get_price_excluding_tax( $product, [ 'price' => $regular ] );
            $sale_to_show    = wc_get_price_excluding_tax( $product, [ 'price' => $sale ] );
        }

        if ( $sale > 0 && $sale < $regular ) {
            return wc_format_sale_price( wc_price( $regular_to_show ), wc_price( $sale_to_show ) );
        }

        return wc_price( $regular );
    }

    /**
     * Format the wholesale only price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_wholesale_only_price_html( \WC_Product $product ): string {
        $discount = PricingHelper::apply_wholesale_discount( $product->get_price(), $product, true );

        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );
        if ( 'incl' === $tax_display_shop ) {
            $discounted_to_show = wc_get_price_including_tax( $product, [ 'price' => $discount ] );
        } else {
            $discounted_to_show = wc_get_price_excluding_tax( $product, [ 'price' => $discount ] );
        }

        return $this->get_wholesale_price_html( wc_price( $discounted_to_show ) );
    }

    /**
     * Format the retail and wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_retail_and_wholesale_price_html( \WC_Product $product ): string {
        $regular = (float) $product->get_regular_price();

        $sale = (float) $product->get_sale_price();

        $discounted = PricingHelper::apply_wholesale_discount( $sale > 0 ? $sale : $regular, $product, true );

        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );

        if ( 'incl' === $tax_display_shop ) {
            $regular_to_show    = wc_get_price_including_tax( $product, [ 'price' => $regular ] );
            $sale_to_show       = wc_get_price_including_tax( $product, [ 'price' => $sale ] );
            $discounted_to_show = wc_get_price_including_tax( $product, [ 'price' => $discounted ] );
        } else {
            $regular_to_show    = wc_get_price_excluding_tax( $product, [ 'price' => $regular ] );
            $sale_to_show       = wc_get_price_excluding_tax( $product, [ 'price' => $sale ] );
            $discounted_to_show = wc_get_price_excluding_tax( $product, [ 'price' => $discounted ] );
        }

        $html  = '<span class="yay-retail-price">Retail: ';
        $html .= ( $sale > 0 && $sale < $regular )
            ? '<del>' . wc_price( $regular_to_show ) . '</del> <ins>' . wc_price( $sale_to_show ) . '</ins>'
            : wc_price( $regular_to_show );
        $html .= '</span><br>';
        $html .= '<span class="yay-wholesale-price">'
            . $this->get_wholesale_price_html( wc_price( $discounted_to_show ) )
            . '</span>';

        return $html;
    }

    /**
     * Get the discounted variation prices
     *
     * @param \WC_Product $product The product object.
     * @return array The discounted variation prices.
     */
    protected function get_discounted_variation_prices( \WC_Product $product ): array {
        $prices = $product->get_variation_prices( true );
        if ( ! isset( $prices['price'] ) ) {
            return [];
        }

        $discounted = [];
        foreach ( $prices['price'] as $vid => $price ) {
            $variation = wc_get_product( $vid );
            if ( ! $variation ) {
                continue;
            }
            $discounted[] = (float) PricingHelper::apply_wholesale_discount( (float) $price, $variation, true );
        }
        return $discounted;
    }

    /**
     * Format the variable wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_variable_wholesale_price_html( \WC_Product $product ): string {
        $display_mode = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';

        // Remove the filter to avoid recursion
        remove_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999 );

        // If format = retail-only => display retail price as WooCommerce standard
        if ( 'retail-only' === $display_mode ) {
            $html = $product->get_price_html();
            add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );
            return $html;
        }

        $discounted = $this->get_discounted_variation_prices( $product );
        if ( empty( $discounted ) ) {
            $html = $product->get_price_html();
            add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );
            return $html;
        }

        $min_ws = min( $discounted );
        $max_ws = max( $discounted );

        $prices  = $product->get_variation_prices( true );
        $regular = isset( $prices['regular_price'] ) ? array_filter( array_map( 'floatval', $prices['regular_price'] ) ) : [];

        $is_wholesale_only = empty( $regular );
        $wholesale_price   = ( $min_ws !== $max_ws )
        ? wc_format_price_range( wc_price( $min_ws ), wc_price( $max_ws ) )
        : wc_price( $min_ws );

        $label = $this->get_wholesale_price_html( $wholesale_price );

        // Wholesale-only mode
        if ( 'wholesale-only' === $display_mode || $is_wholesale_only ) {
            $html = $label . $product->get_price_suffix();
            add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );
            return $html;
        }

        // Retail-and-wholesale mode
        if ( count( $regular ) > 1 ) {
            sort( $regular );
            $min_r      = (float) current( $regular );
            $max_r      = (float) end( $regular );
            $price_html = wc_format_price_range( wc_price( $min_r ), wc_price( $max_r ) );
        } else {
            $price_html = wc_price( (float) current( $regular ) );
        }

        if ( $price_html === $wholesale_price ) {
            add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );
            return $price_html . $product->get_price_suffix();
        }

        $sale_html = wc_format_sale_price( $price_html, $wholesale_price );

        // Replace only the last found in the string
        $pos = strrpos( $sale_html, $wholesale_price );
        if ( false === $pos ) {
            $pos = 0;
        }
        $html = substr_replace( $sale_html, $label, $pos, strlen( $wholesale_price ) );

        // Add the filter again
        add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );

        return $html;
    }

    /**
     * Get the wholesale label HTML
     *
     * @param string $discounted_price_html the discounted price HTML.
     * @return string The wholesale price HTML.
     */
    protected function get_wholesale_price_html( string $discounted_price_html ): string {
        $label = $this->settings['display']['wholesale_price_label'] ?? __( 'Wholesale price', 'yay-wholesale-b2b' );
        $color = $this->settings['display']['wholesale_price_color'] ?? '#333333';
        return '<span class="yay-wholesale-label">' . esc_html( $label ) . ':</span> '
                . '<span style="color:' . esc_attr( $color ) . '">' . $discounted_price_html . '</span>';
    }

    /**
     * Run when order has just been placed from the checkout hook
     *
     * @param int       $order_id The order object.
     * @param array     $posted_data the data object.
     * @param \WC_Order $order The order object.
     */
    public function ywhs_checkout_wholesale_order_handling( $order_id, $posted_data, $order ) {
        $customer       = get_user_by( 'ID', $order->get_customer_id() );
        $wholesale_role = CustomerHelper::get_wholesale_role( $customer );

        if ( ! isset( $wholesale_role ) ) {
            return;
        }

        $is_discounted = PricingHelper::check_is_discounted( $order, $wholesale_role );

        PricingHelper::handle_order( $order, $wholesale_role, $is_discounted );
    }
}
