<?php
namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\PricingHelpers\OrderPricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\PricingHelpers\ShopPricingHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Utils\Utils;

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

        add_filter( 'woocommerce_get_variation_prices_hash', [ $this, 'ywhs_variation_prices_hash' ], 99, 1 );

        add_filter( 'woocommerce_get_price_html', [ $this, 'ywhs_display_wholesale_price_html' ], 999, 2 );

        add_action( 'woocommerce_before_calculate_totals', [ $this, 'before_calculate_totals' ], 103 );

        add_filter( 'woocommerce_cart_item_price', [ $this, 'cart_item_price' ], 999, 3 );

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

        $is_checking_mov = apply_filters( 'ywhs_is_force_checking_requirement', is_checkout() || Utils::is_checkout_blocks() );
        $role_config     = CustomerHelper::get_current_user_wholesale_role();

        $is_discounted = true;
        if ( $is_checking_mov ) {
            $is_discounted = RequirementHelper::is_cart_meet_requirement( $role_config );
        }

        if ( $is_discounted ) {
            do_action( 'ywhs_before_cart_calculate_totals', $cart );
            foreach ( $cart->get_cart_contents() as $cart_item_key => $cart_item ) {
                if ( ! empty( $cart_item['data'] ) ) {
                    do_action( 'ywhs_before_cart_item_calculate_totals', $cart );

                    $cart_item_data = $cart_item['data'];
                    $quantity       = $cart_item['quantity'];
                    // var_dump( $cart_item_data->get_price() );

                    $discounted_price = ShopPricingHelper::get_cart_item_wholesale_price( $cart_item_data, $role_config, $quantity );
                    // var_dump( $discounted_price );

                    $cart_item_data->set_price( $discounted_price );

                    do_action( 'ywhs_after_cart_item_calculate_totals', $cart );
                }//end if
            }//end foreach
            do_action( 'ywhs_after_cart_calculate_totals', $cart );
        }//end if
    }

    /**
     * Update price display in mini-cart
     *
     * @param string $price_html The hash array.
     * @param array  $cart_item the cart item.
     * @return string
     */
    public function cart_item_price( $price_html, $cart_item, $cart_item_key ) {
        if ( empty( $cart_item['data'] ) ) {
            return $price_html;
        }

        $cart_item_data = $cart_item['data'];
        $role_config    = CustomerHelper::get_current_user_wholesale_role();

        $regular  = (float) $cart_item_data->get_regular_price();
        $sale     = (float) $cart_item_data->get_sale_price();
        $quantity = $cart_item['quantity'];

        $discounted = ShopPricingHelper::get_cart_item_wholesale_price( $cart_item_data, $role_config, $quantity );

        $tax_display_cart = get_option( 'woocommerce_tax_display_cart', 'excl' );

        if ( 'incl' === $tax_display_cart ) {
            $regular    = wc_get_price_including_tax( $cart_item_data, [ 'price' => $regular ] );
            $discounted = wc_get_price_including_tax( $cart_item_data, [ 'price' => $discounted ] );
        } else {
            $regular    = wc_get_price_excluding_tax( $cart_item_data, [ 'price' => $regular ] );
            $discounted = wc_get_price_excluding_tax( $cart_item_data, [ 'price' => $discounted ] );
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
    public function ywhs_variation_prices_hash( array $hash ) {
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
    public function ywhs_display_wholesale_price_html( string $price_html, \WC_Product $product ) {
        $show_to_all                 = $this->settings['general']['show_wholesale_price'] ?? false;
        $display_mode                = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';
        $current_user_wholesale_role = CustomerHelper::get_current_user_wholesale_role();
        $is_wholesale                = ! empty( $current_user_wholesale_role );

        if ( ! $is_wholesale && ! $show_to_all ) {
            return $price_html;
        }

        if ( $is_wholesale ) {
            $display_wholesale_role = $current_user_wholesale_role;
        } else {
            $display_wholesale_role = RolesHelper::get_default_wholesale_role();
        }
        $discounted_price = ShopPricingHelper::get_wholesale_price_for_display( $product, $display_wholesale_role );

        // If variable product
        if ( $product->is_type( 'variable' ) ) {
            return $this->format_variable_wholesale_price_html( $product, $display_wholesale_role, $price_html );
        }

        if ( $product->is_type( 'grouped' ) ) {
            return $this->format_grouped_wholesale_price_html( $product, $display_wholesale_role, $price_html );
        }

        switch ( $display_mode ) {
            case 'wholesale-only':
                return $this->format_wholesale_only_price_html( $product, $discounted_price );
            case 'retail-only':
                return $price_html;
            case 'retail-and-wholesale':
            default:
                return $this->format_retail_and_wholesale_price_html( $product, $discounted_price, $price_html );
        }
    }

    /**
     * Format the retail only price HTML
     *
     * @param \WC_Product $product The product object.
     * @return string The formatted HTML.
     */
    protected function format_retail_only_price_html( \WC_Product $product ) {
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
     * @param float       $discounted_price The discounted price of product.
     * @return string The formatted HTML.
     */
    protected function format_wholesale_only_price_html( \WC_Product $product, float $discounted_price ) {
        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );
        if ( 'incl' === $tax_display_shop ) {
            $discounted_to_show = wc_get_price_including_tax( $product, [ 'price' => $discounted_price ] );
        } else {
            $discounted_to_show = wc_get_price_excluding_tax( $product, [ 'price' => $discounted_price ] );
        }

        return $this->get_wholesale_price_html( wc_price( $discounted_to_show ) );
    }

    /**
     * Format the retail and wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @param float       $discounted_price The discounted price.
     * @param string      $price_html the default price html.
     * @return string The formatted HTML.
     */
    protected function format_retail_and_wholesale_price_html( \WC_Product $product, float $discounted_price, string $price_html ) {
        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );

        if ( 'incl' === $tax_display_shop ) {
            $discounted_to_show = wc_get_price_including_tax( $product, [ 'price' => $discounted_price ] );
        } else {
            $discounted_to_show = wc_get_price_excluding_tax( $product, [ 'price' => $discounted_price ] );
        }

        $html  = '<span class="yay-retail-price">Retail: ';
        $html .= $price_html;
        $html .= '</span><br>';
        $html .= '<span class="yay-wholesale-price">'
            . $this->get_wholesale_price_html( wc_price( $discounted_to_show ) )
            . '</span>';

        return $html;
    }

    /**
     * Format the variable wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @param array       $wholesale_role The wholesale role.
     * @param string      $price_html The default price HTML.
     * @return string The formatted HTML.
     */
    protected function format_variable_wholesale_price_html( \WC_Product $product, array $wholesale_role, string $price_html ) {
        $display_mode = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';
        // If format = retail-only => display retail price as WooCommerce standard
        if ( 'retail-only' === $display_mode ) {
            return $price_html;
        }

        $discounted = ShopPricingHelper::get_wholesale_prices_display_from_variants( $product, $wholesale_role );
        if ( empty( $discounted ) ) {
            return $price_html;
        }

        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );
        if ( 'incl' === $tax_display_shop ) {
            $min_ws = wc_get_price_including_tax( $product, [ 'price' => min( $discounted ) ] );
            $max_ws = wc_get_price_including_tax( $product, [ 'price' => max( $discounted ) ] );
        } else {
            $min_ws = wc_get_price_excluding_tax( $product, [ 'price' => min( $discounted ) ] );
            $max_ws = wc_get_price_excluding_tax( $product, [ 'price' => max( $discounted ) ] );
        }

        // $prices = $product->get_variation_prices( true );
        // $regular = isset( $prices['regular_price'] ) ? array_filter( array_map( 'floatval', $prices['regular_price'] ) ) : [];

        // $is_wholesale_only = empty( $regular );
        $wholesale_price = ( $min_ws !== $max_ws )
        ? wc_format_price_range( wc_price( $min_ws ), wc_price( $max_ws ) )
        : wc_price( $min_ws );

        $wholesale_price_html = $this->get_wholesale_price_html( $wholesale_price . $product->get_price_suffix() );

        // Wholesale-only mode
        if ( 'wholesale-only' === $display_mode ) {
            return $wholesale_price_html;
        }

        // Retail-and-wholesale mode
        // if ( count( $regular ) > 1 ) {
        // sort( $regular );
        // $min_r = (float) current( $regular );
        // $max_r = (float) end( $regular );
        // if ( $min_r !== $max_r ) {
        // $price_html = wc_format_price_range( wc_price( $min_r ), wc_price( $max_r ) );
        // } else {
        // $price_html = wc_price( $min_r );
        // }
        // } else {
        // $price_html = wc_price( (float) current( $regular ) );
        // }

        if ( $price_html === $wholesale_price ) {
            return $wholesale_price_html;
        }

        $sale_html = wc_format_sale_price( $price_html, '<br/>' . $wholesale_price );

        // Replace only the last found in the string
        $pos = strrpos( $sale_html, $wholesale_price );
        if ( false === $pos ) {
            $pos = 0;
        }
        $html = substr_replace( $sale_html, $wholesale_price_html, $pos, strlen( $wholesale_price ) );

        return $html;
    }

    /**
     * Format the grouped-product's wholesale price HTML
     *
     * @param \WC_Product $product The product object.
     * @param array       $wholesale_role The wholesale role.
     * @param string      $price_html The default price HTML.
     * @return string The formatted HTML.
     */
    protected function format_grouped_wholesale_price_html( \WC_Product $product, array $wholesale_role, string $price_html ) {
        $display_mode = $this->settings['display']['price_format'] ?? 'retail-and-wholesale';
        // If format = retail-only => display retail price as WooCommerce standard
        if ( 'retail-only' === $display_mode ) {
            return $price_html;
        }

        $discounted = ShopPricingHelper::get_wholesale_prices_display_from_grouped( $product, $wholesale_role );
        if ( empty( $discounted ) ) {
            return $price_html;
        }

        $tax_display_shop = get_option( 'woocommerce_tax_display_shop', 'excl' );
        if ( 'incl' === $tax_display_shop ) {
            $min_ws = wc_get_price_including_tax( $product, [ 'price' => min( $discounted ) ] );
            $max_ws = wc_get_price_including_tax( $product, [ 'price' => max( $discounted ) ] );
        } else {
            $min_ws = wc_get_price_excluding_tax( $product, [ 'price' => min( $discounted ) ] );
            $max_ws = wc_get_price_excluding_tax( $product, [ 'price' => max( $discounted ) ] );
        }

        $wholesale_price = ( $min_ws !== $max_ws )
        ? wc_format_price_range( wc_price( $min_ws ), wc_price( $max_ws ) )
        : wc_price( $min_ws );

        $wholesale_price_html = $this->get_wholesale_price_html( $wholesale_price . $product->get_price_suffix() );

        // Wholesale-only mode
        if ( 'wholesale-only' === $display_mode ) {
            return $wholesale_price_html;
        }

        // Retail-and-wholesale mode
        if ( $price_html === $wholesale_price ) {
            return $wholesale_price_html;
        }

        $sale_html = wc_format_sale_price( $price_html, '<br/>' . $wholesale_price );

        // Replace only the last found in the string
        $pos = strrpos( $sale_html, $wholesale_price );
        if ( false === $pos ) {
            $pos = 0;
        }
        $html = substr_replace( $sale_html, $wholesale_price_html, $pos, strlen( $wholesale_price ) );

        return $html;
    }

    /**
     * Get the wholesale label HTML
     *
     * @param string $discounted_price_html the discounted price HTML.
     * @return string The wholesale price HTML.
     */
    protected function get_wholesale_price_html( string $discounted_price_html ) {
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

        $is_discounted = RequirementHelper::is_order_meet_requirement( $order, $wholesale_role );

        OrderPricingHelper::handle_order( $order, $wholesale_role, $is_discounted );
    }
}
