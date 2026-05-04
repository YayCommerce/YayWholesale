<?php
namespace YayWholesaleB2B\Engine\Frontend;

use WC_Tax;
use YayWholesaleB2B\Engine\Compatibles\YayCurrency;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\RolesHelper;
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
        $this->add_price_hooks();

        $this->add_sale_price_hooks();

        add_filter( 'woocommerce_variation_prices_array', [ $this, 'ywhs_variation_prices' ], 999, 2 );
        add_filter( 'woocommerce_get_variation_prices_hash', [ $this, 'ywhs_variation_prices_hash' ], 99, 1 );

        add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );

        add_action( 'woocommerce_checkout_order_processed', [ $this, 'ywhs_checkout_wholesale_order_handling' ], 999, 3 );

        add_filter( 'woocommerce_product_is_on_sale', [ $this, 'ywhs_is_on_sale_product' ], 10, 2 );
    }

    protected function remove_price_hooks() {
        remove_filter( 'woocommerce_product_get_price', [ $this, 'ywhs_get_price' ], 999 );
        remove_filter( 'woocommerce_product_variation_get_price', [ $this, 'ywhs_get_price' ], 999 );
        remove_filter( 'woocommerce_variation_prices_price', [ $this, 'ywhs_get_price' ], 999 );
    }

    protected function add_price_hooks() {
        add_filter( 'woocommerce_product_get_price', [ $this, 'ywhs_get_price' ], 999, 2 );
        add_filter( 'woocommerce_product_variation_get_price', [ $this, 'ywhs_get_price' ], 999, 2 );
        add_filter( 'woocommerce_variation_prices_price', [ $this, 'ywhs_get_price' ], 999, 2 );
    }

    protected function remove_sale_price_hooks() {
        remove_filter( 'woocommerce_product_get_sale_price', [ $this, 'ywhs_get_sale_price' ], 999 );
        remove_filter( 'woocommerce_product_variation_get_sale_price', [ $this, 'ywhs_get_sale_price' ], 999 );
        remove_filter( 'woocommerce_variation_prices_sale_price', [ $this, 'ywhs_get_sale_price' ], 999 );
    }

    protected function add_sale_price_hooks() {
        add_filter( 'woocommerce_product_get_sale_price', [ $this, 'ywhs_get_sale_price' ], 999, 2 );
        add_filter( 'woocommerce_product_variation_get_sale_price', [ $this, 'ywhs_get_sale_price' ], 999, 2 );
        add_filter( 'woocommerce_variation_prices_sale_price', [ $this, 'ywhs_get_sale_price' ], 999, 2 );
    }

    /**
     * Get the price
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @return float The price.
     */
    public function ywhs_get_price( $price, \WC_Product $product ) {
        return PricingHelper::apply_wholesale_discount( $price, $product, false );
    }

    /**
     * Get the sale price
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @return float The sale price.
     */
    public function ywhs_get_sale_price( $price, \WC_Product $product ) {
        return PricingHelper::apply_wholesale_discount( $price, $product, false );
    }

    /**
     * Get the variation prices
     *
     * @param array       $prices The prices array.
     * @param \WC_Product $product The product object.
     * @return array The variation prices.
     */
    public function ywhs_variation_prices( array $prices, \WC_Product $product ): array {
        foreach ( $prices as $vid => $price ) {
            $variation = wc_get_product( $vid );
            if ( $variation ) {
                $prices[ $vid ] = PricingHelper::apply_wholesale_discount( $price, $variation, false );
            }
        }
        return $prices;
    }

    /**
     * Get the variation prices hash
     *
     * @param array $hash The hash array.
     * @return array The variation prices hash.
     */
    public function ywhs_variation_prices_hash( array $hash ): array {
        $role = PricingHelper::get_effective_role();
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
        $role         = PricingHelper::get_effective_role( false );
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
        $this->remove_sale_price_hooks();

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

        $this->add_sale_price_hooks();

        return wc_price( $regular );
    }

    /**
     * Format the wholesale only price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_wholesale_only_price_html( \WC_Product $product ): string {
        $this->remove_price_hooks();

        $discount = PricingHelper::apply_wholesale_discount( $product->get_price(), $product, true );

        $this->add_price_hooks();

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

        $this->remove_sale_price_hooks();

        $sale = (float) $product->get_sale_price();

        $this->add_sale_price_hooks();

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
        $customer_id    = $order->get_customer_id();
        $wholesale_role = RolesHelper::is_wholesale_user( $customer_id );

        if ( ! isset( $wholesale_role ) ) {
            return;
        }

        $is_discounted = PricingHelper::check_is_discounted( $order, $wholesale_role );

        PricingHelper::handle_order( $order, $wholesale_role, $is_discounted );
    }

    /**
     * Exclude sale badge ( Wholesale Price is not a sale price )
     *
     * @param bool        $is_on_sale The on-sale status.
     * @param \WC_Product $product The product.
     */
    public function ywhs_is_on_sale_product( $is_on_sale, $product ) {
        $is_on_sale_from_third_party = apply_filters( 'ywhs_is_on_sale_by_third_party', false );

        return $is_on_sale_from_third_party || $product->is_on_sale( 'edit' );
    }
}
