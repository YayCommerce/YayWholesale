<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\SettingsHelper;

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
        add_filter( 'woocommerce_product_get_price', [ $this, 'get_price' ], 99, 2 );
        add_filter( 'woocommerce_product_variation_get_price', [ $this, 'get_price' ], 99, 2 );
        add_filter( 'woocommerce_variation_prices_price', [ $this, 'get_price' ], 99, 2 );

        add_filter( 'woocommerce_product_get_sale_price', [ $this, 'get_sale_price' ], 99, 2 );
        add_filter( 'woocommerce_product_variation_get_sale_price', [ $this, 'get_sale_price' ], 99, 2 );
        add_filter( 'woocommerce_variation_prices_sale_price', [ $this, 'get_sale_price' ], 99, 2 );

        add_filter( 'woocommerce_variation_prices_array', [ $this, 'variation_prices' ], 99, 2 );
        add_filter( 'woocommerce_get_variation_prices_hash', [ $this, 'variation_prices_hash' ], 99, 1 );

        add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
    }

    /**
     * Get the effective role
     *
     * @param bool $allow_default Allow default role.
     * @return array|null The effective role or null if not found.
     */
    protected function get_effective_role( bool $allow_default = false ): ?array {
        $role = RolesHelper::is_wholesale_user();

        if ( ! $role && $allow_default && ! empty( $this->settings['general']['default_role'] ) ) {
            $roles = get_option( 'yay_wholesale_roles', [] );
            $role  = RolesHelper::get_role_by_slug( $roles, $this->settings['general']['default_role'] );
            if ( ! $role || empty( $role['status'] ) ) {
                return null;
            }
        }
        return $role;
    }

    /**
     * Check if the cart conditions are met
     *
     * @param array $role The role array.
     * @return bool True if the cart conditions are met, false otherwise.
     */
    public function meets_cart_conditions( array $role ): bool {
        if ( ! class_exists( 'WC_Cart' ) || ! WC()->cart ) {
            return true;
        }

        $qty   = WC()->cart->get_cart_contents_count();
        $total = (float) WC()->cart->get_subtotal();

        $min_qty    = $role['minOrderQuantity'] ?? 0;
        $min_amount = $role['minOrderAmount'] ?? 0;

        if ( ( $min_qty > 0 && $qty < $min_qty ) || ( $min_amount > 0 && $total < $min_amount ) ) {
            return false;
        }

        return true;
    }

    /**
     * Apply the wholesale discount
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @param bool        $is_preview Is preview.
     * @return float The discounted price.
     */
    protected function apply_wholesale_discount( $price, \WC_Product $product, bool $is_preview = false ) {
        $show_to_all = $this->settings['general']['show_wholesale_price'] ?? false;

        $role = $this->get_effective_role( false );
        if ( ! $role && $is_preview && $show_to_all ) {
            $role = $this->get_effective_role( true );
        }

        if ( ! $role ) {
            return $price;
        }

        $discount = isset( $role['discount'] ) ? ( (float) $role['discount'] / 100 ) : 0;
        if ( $discount <= 0 ) {
            return $price;
        }

        $is_actual_wholesale = (bool) $this->get_effective_role( false );
        if ( $is_actual_wholesale && ! $this->meets_cart_conditions( $role ) ) {
            return $price;
        }

        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $regular       = (float) $product->get_regular_price( 'edit' );
        $sale          = (float) $product->get_sale_price( 'edit' );

        $base = ( $apply_to_sale && $sale > 0 ) ? $sale : $regular;
        $new  = max( 0, $base * ( 1 - $discount ) );

        return wc_format_decimal( $new, wc_get_price_decimals() );
    }

    /**
     * Get the price
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @return float The price.
     */
    public function get_price( $price, \WC_Product $product ) {
        return $this->apply_wholesale_discount( $price, $product, false );
    }

    /**
     * Get the sale price
     *
     * @param float       $price The price.
     * @param \WC_Product $product The product object.
     * @return float The sale price.
     */
    public function get_sale_price( $price, \WC_Product $product ) {
        return $this->apply_wholesale_discount( $price, $product, false );
    }

    /**
     * Get the variation prices
     *
     * @param array       $prices The prices array.
     * @param \WC_Product $product The product object.
     * @return array The variation prices.
     */
    public function variation_prices( array $prices, \WC_Product $product ): array {
        foreach ( $prices as $vid => $price ) {
            $variation = wc_get_product( $vid );
            if ( $variation ) {
                $prices[ $vid ] = $this->apply_wholesale_discount( $price, $variation, false );
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
    public function variation_prices_hash( array $hash ): array {
        $role = $this->get_effective_role();
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
    public function display_wholesale_price_html( string $price_html, \WC_Product $product ): string {

        $show_to_all  = $this->settings['general']['show_wholesale_price'] ?? false;
        $display_mode = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';
        $is_logged_in = is_user_logged_in();
        $role         = $this->get_effective_role( false );
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
        $regular = (float) $product->get_regular_price( 'edit' );
        $sale    = (float) $product->get_sale_price( 'edit' );

        if ( $sale > 0 && $sale < $regular ) {
            return wc_format_sale_price( wc_price( $regular ), wc_price( $sale ) );
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
        $discount = $this->apply_wholesale_discount( $product->get_price( 'edit' ), $product, true );
        return $this->get_wholesale_label_html() . wc_price( $discount );
    }

    /**
     * Format the retail and wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_retail_and_wholesale_price_html( \WC_Product $product ): string {
        $regular    = (float) $product->get_regular_price( 'edit' );
        $sale       = (float) $product->get_sale_price( 'edit' );
        $discounted = $this->apply_wholesale_discount( $sale > 0 ? $sale : $regular, $product, true );

        // $html  = '<span class="yay-retail-price">Retail: ';
        $html  = '<span class="yay-retail-price">';
        $html .= ( $sale > 0 && $sale < $regular )
            ? '<del>' . wc_price( $regular ) . '</del> <ins>' . wc_price( $sale ) . '</ins>'
            : wc_price( $regular );
        $html .= '</span><br>';
        $html .= '<span class="yay-wholesale-price">'
            . $this->get_wholesale_label_html()
            . wc_price( $discounted )
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
            $discounted[] = (float) $this->apply_wholesale_discount( (float) $price, $variation, true );
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
        remove_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999 );

        // If format = retail-only => display retail price as WooCommerce standard
        if ( 'retail-only' === $display_mode ) {
            $html = $product->get_price_html();
            add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
            return $html;
        }

        $discounted = $this->get_discounted_variation_prices( $product );
        if ( empty( $discounted ) ) {
            $html = $product->get_price_html();
            add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
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

        $label = $this->get_wholesale_label_html();

        // Wholesale-only mode
        if ( 'wholesale-only' === $display_mode || $is_wholesale_only ) {
            $html = $label . $wholesale_price . $product->get_price_suffix();
            add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
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
            add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
            return $price_html . $product->get_price_suffix();
        }

        $sale_html = wc_format_sale_price( $price_html, $wholesale_price );
        $html      = str_replace( $wholesale_price, $label . $wholesale_price, $sale_html );

        // Add the filter again
        add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );

        return $html;
    }

    /**
     * Get the wholesale label HTML
     *
     * @return string The wholesale label HTML.
     */
    protected function get_wholesale_label_html(): string {
        $label = $this->settings['display']['wholesale_price_label'] ?? __( 'Wholesale price', 'yay-wholesale' );
        $color = $this->settings['display']['wholesale_price_color'] ?? '#333333';
        return '<span class="yay-wholesale-label" style="color:' . esc_attr( $color ) . '">' . esc_html( $label ) . ':</span> ';
    }
}
