<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;
defined( 'ABSPATH' ) || exit;
/**
 * Pricing Page
 */
class Pricing {
    use SingletonTrait;

    protected function __construct() {
        // Product prices
        add_filter( 'woocommerce_product_get_price', [ $this, 'get_price' ], 99, 2 );
        add_filter( 'woocommerce_product_variation_get_price', [ $this, 'get_price' ], 99, 2 );
        add_filter( 'woocommerce_variation_prices_price', [ $this, 'get_price' ], 99, 2 );

        // Sale prices
        add_filter( 'woocommerce_product_get_sale_price', [ $this, 'get_sale_price' ], 99, 2 );
        add_filter( 'woocommerce_product_variation_get_sale_price', [ $this, 'get_sale_price' ], 99, 2 );
        add_filter( 'woocommerce_variation_prices_sale_price', [ $this, 'get_sale_price' ], 99, 2 );

        // Variation prices
        add_filter( 'woocommerce_variation_prices_array', [ $this, 'variation_prices' ], 99, 2 );
        add_filter( 'woocommerce_get_variation_prices_hash', [ $this, 'variation_prices_hash' ], 99, 1 );
        add_filter( 'woocommerce_show_variation_price', [ $this, 'show_variation_prices' ], 99, 3 );

        // html output
        add_filter( 'woocommerce_get_price_html', [ $this, 'display_wholesale_price_html' ], 999, 2 );
    }

    /**
     * Check if current cart meets role conditions.
     *
     * @param array[] $role The role array.
     * @return bool True if the cart meets the role conditions, false otherwise.
     */
    public function meets_cart_conditions( array $role ): bool {
        if ( ! class_exists( 'WC_Cart' ) || ! WC()->cart ) {
            return true;
        }

        $cart_qty   = WC()->cart->get_cart_contents_count();
        $cart_total = (float) WC()->cart->get_subtotal();

        $min_qty    = isset( $role['minOrderQuantity'] ) ? $role['minOrderQuantity'] : 0;
        $min_amount = isset( $role['minOrderAmount'] ) ? $role['minOrderAmount'] : 0;

        if ( $min_qty > 0 && $cart_qty < $min_qty ) {
            return false;
        }

        if ( $min_amount > 0 && $cart_total < $min_amount ) {
            return false;
        }

        return true;
    }

    /**
     * Apply wholesale discount to product price
     *
     * @param float       $price The price to apply the discount to.
     * @param \WC_Product $product The product object.
     * @return float The discounted price.
     */
    public function get_price( $price, \WC_Product $product ): mixed {
        if ( ! $product ) {
            return $price;
        }

        return $this->apply_wholesale_discount( $price, $product );
    }

    /**
     * Apply wholesale discount to sale price
     *
     * @param float       $price The price to apply the discount to.
     * @param \WC_Product $product The product object.
     * @return float The discounted price.
     */
    public function get_sale_price( $price, \WC_Product $product ): mixed {
        if ( ! $product ) {
            return $price;
        }

        return $this->apply_wholesale_discount( $price, $product );
    }

    /**
     * Apply wholesale discount to variation prices array
     *
     * @param array[]     $prices The prices array.
     * @param \WC_Product $product The product object.
     * @return array[] The prices array.
     */
    public function variation_prices( array $prices, \WC_Product $product ): array {
        if ( ! $product ) {
            return $prices;
        }

        foreach ( $prices as $variation_id => $price ) {
            $variation = wc_get_product( $variation_id );
            if ( $variation ) {
                $prices[ $variation_id ] = $this->apply_wholesale_discount( $price, $variation );
            }
        }
        return $prices;
    }

    /**
     * Generate a hash for the variation prices
     *
     * @param array[] $price_hash The hash array.

     * @return array[] The hash array.
     */
    public function variation_prices_hash( array $price_hash ): array {
        if ( ! is_user_logged_in() ) {
            return $price_hash;
        }
        $roles          = get_option( 'yay_wholesale_roles', [] );
        $user           = wp_get_current_user();
        $user_role_slug = RolesHelper::get_user_wholesale_role( $user, $roles );
        if ( $user_role_slug ) {
            $price_hash[] = $user_role_slug;
        }

        return $price_hash;
    }

    /**
     * Decide if variation prices should be shown
     *
     * @param bool                  $show Whether to show the variation prices.
     * @param \WC_Product           $parent_product The parent product object.
     * @param \WC_Product_Variation $variation The variation object.
     * @return bool Whether to show the variation prices.
     */
    public function show_variation_prices( bool $show, \WC_Product $parent_product, \WC_Product_Variation $variation ): bool {
        if ( ! is_user_logged_in() ) {
            return $show;
        }

        if ( apply_filters( 'yay_wholesale_hide_variation_prices', false ) ) {
            return false;
        }

        return $show;
    }

    /**
     * Apply wholesale discount to a price
     *
     * @param float       $price The price to apply the discount to.
     * @param \WC_Product $product The product object.
     * @return float The discounted price.
     */
    protected function apply_wholesale_discount( $price, \WC_Product $product ): mixed {
        if ( ! is_user_logged_in() ) {
            return $price;
        }

        $user           = wp_get_current_user();
        $roles          = get_option( 'yay_wholesale_roles', [] );
        $user_role_slug = RolesHelper::get_user_wholesale_role( $user, $roles );

        if ( ! $user_role_slug ) {
            return $price;
        }

        $role = RolesHelper::get_role_by_slug( $roles, $user_role_slug );
        if ( ! $role || ! isset( $role['status'] ) || ! $role['status'] ) {
            return $price;
        }

        $discount = isset( $role['discount'] ) ? (float) $role['discount'] / 100 : 0;
        if ( $discount <= 0 || ! $this->meets_cart_conditions( $role ) ) {
            return $price;
        }

        $apply_to_sale = $role['applyToSalePrice'] ?? false;
        $regular_price = (float) $product->get_regular_price( 'edit' );
        $sale_price    = (float) $product->get_sale_price( 'edit' );

        $new_price = ( $apply_to_sale && $sale_price > 0 ) ? $sale_price * ( 1 - $discount ) : $regular_price * ( 1 - $discount );

        return wc_format_decimal( max( 0, $new_price ), wc_get_price_decimals() );
    }

    /**
     * Display the wholesale price on the product page
     *
     * @param string      $price_html The product price HTML.
     * @param \WC_Product $product The product object.
     * @return string The product price HTML with the wholesale price.
     */
    public function display_wholesale_price_html( string $price_html, \WC_Product $product ): string {
        if ( ! is_user_logged_in() ) {
            return $price_html;
        }

        $user           = wp_get_current_user();
        $roles          = get_option( 'yay_wholesale_roles', [] );
        $user_role_slug = RolesHelper::get_user_wholesale_role( $user, $roles );
        if ( ! $user_role_slug ) {
            return $price_html;
        }

        $role = RolesHelper::get_role_by_slug( $roles, $user_role_slug );
        if ( ! $role ) {
            return $price_html;
        }

        // Check cart conditions
        if ( ! $this->meets_cart_conditions( $role ) ) {
            return $price_html;
        }

        do_action( 'yay_wholesale_price_handler_before_price_html' );

        // ---------- Variable Product ----------
        if ( $product->is_type( 'variable' ) ) {
            $prices            = $product->get_variation_prices( true );
            $discounted_prices = [];

            foreach ( $prices['price'] as $variation_id => $price ) {
                $variation = wc_get_product( $variation_id );
                if ( $variation ) {
                    $apply_to_sale     = $role['applyToSalePrice'] ?? false;
                    $variation_sale    = (float) $variation->get_sale_price( 'edit' );
                    $variation_regular = (float) $variation->get_regular_price( 'edit' );

                    $price_to_discount   = ( $apply_to_sale && $variation_sale > 0 ) ? $variation_sale : $variation_regular;
                    $discounted_prices[] = $this->apply_wholesale_discount( $price_to_discount, $variation );
                }
            }

            if ( empty( $discounted_prices ) ) {
                return $price_html;
            }

            $min_ws_price = min( $discounted_prices );
            $max_ws_price = max( $discounted_prices );

            $regular_prices    = array_filter( array_map( 'floatval', $prices['regular_price'] ) );
            $is_wholesale_only = empty( $regular_prices );

            // Format wholesale price range
            if ( $min_ws_price !== $max_ws_price ) {
                $wholesale_price = wc_format_price_range(
                    wc_get_price_to_display( $product, [ 'price' => $min_ws_price ] ),
                    wc_get_price_to_display( $product, [ 'price' => $max_ws_price ] )
                );
                $price_class     = 'yay-wholesale-price-range';
            } else {
                $wholesale_price = wc_price( wc_get_price_to_display( $product, [ 'price' => $min_ws_price ] ) );
                $price_class     = '';
            }

            // Format regular price range
            if ( get_option( 'yay_wholesale_show_original_price', 'show' ) === 'hide' || $is_wholesale_only ) {
                $price_html = $wholesale_price . $product->get_price_suffix();
            } else {
                if ( count( $regular_prices ) > 1 ) {
                    $min_price   = (float) current( $regular_prices );
                    $max_price   = (float) end( $regular_prices );
                    $price       = wc_format_price_range( $min_price, $max_price );
                    $price_class = 'yay-wholesale-price-range';
                } else {
                    $price = wc_price( (float) current( $regular_prices ) );
                }

                if ( $price === $wholesale_price ) {
                    $price_html = $price . $product->get_price_suffix();
                } else {
                    $price_html = str_replace(
                        '<del ',
                        '<del class="' . $price_class . '" ',
                        wc_format_sale_price( $price, $wholesale_price )
                    );
                }
            }//end if

            // ---------- Simple Product ----------
        } else {
            $regular_price = (float) $product->get_regular_price( 'edit' );
            $sale_price    = (float) $product->get_sale_price( 'edit' );
            $apply_to_sale = $role['applyToSalePrice'] ?? false;

            $price_to_discount = ( $apply_to_sale && $sale_price > 0 ) ? $sale_price : $regular_price;
            $discounted_price  = $this->apply_wholesale_discount( $price_to_discount, $product );

            $is_on_sale          = $sale_price > 0;
            $show_original_price = get_option( 'yay_wholesale_show_original_price', 'show' ) === 'show';
            $display_price       = $discounted_price;

            if ( ! is_numeric( $regular_price ) || ! $show_original_price ) {
                $regular_price = $display_price;
            }

            if ( (float) $regular_price === (float) $display_price ) {
                $price_html = wc_price( wc_get_price_to_display( $product, [ 'price' => $display_price ] ) )
                            . $product->get_price_suffix();
            } else {
                $price_html = wc_format_sale_price(
                    wc_get_price_to_display( $product, [ 'price' => $regular_price ] ),
                    wc_get_price_to_display( $product, [ 'price' => $display_price ] )
                );
            }
        }//end if

        do_action( 'yay_wholesale_price_handler_after_price_html' );

        return $price_html;
    }
}
