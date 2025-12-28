<?php
namespace Yay_Wholesale\Engine\Frontend;

use WC_Tax;
use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\PricingHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Pricing Engine
 */
class Requirement {
    use SingletonTrait;

    protected function __construct() {
        // --- WooCommerce hooks ---
        add_action( 'woocommerce_widget_shopping_cart_before_buttons', [ $this, 'add_wholesale_requirement' ], 999, 0 );
        add_action( 'woocommerce_before_cart_totals', [ $this, 'add_wholesale_requirement' ], 999, 0 );
        add_action( 'woocommerce_review_order_before_payment', [ $this, 'add_wholesale_requirement' ], 999, 0 );

        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_wholesale_requirement' ], 999 );
        add_action( 'init', [ $this, 'create_block_requirement_block_init' ], 999 );
    }

    /**
     * Render the html of requirement to Frontend block (Mini cart) using action hook
     */
    public function add_wholesale_requirement() {

        $wholesale = RolesHelper::is_wholesale_user();

        if ( ! $wholesale ) {
            return;
        }

        $is_discounted   = isset( $wholesale ) && PricingHelper::meets_discount_conditions( $wholesale );
        $actual_subtotal = PricingHelper::calc_actual_subtotal_of_cart();
        $count           = WC()->cart->get_cart_contents_count();
        $lack_of_amt     = 0;
        $lack_of_qty     = 0;

        if ( $is_discounted ) {
            $notice   = __( "Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉", 'yay-wholesale' );
            $progress = 100;
        } else {
            $lack_of_amt     = $wholesale['minOrderAmount'] - $actual_subtotal;
            $lack_of_qty     = $wholesale['minOrderQuantity'] - $count;
            $progress_of_amt = min( 100, $actual_subtotal / $wholesale['minOrderAmount'] * 100 );
            $progress_of_qty = min( 100, $count / $wholesale['minOrderQuantity'] * 100 );

            $progress = number_format( ( ( $progress_of_amt + $progress_of_qty ) / 2 ), 2 );

            $is_empty = true;
            $phrases  = [];

            if ( $lack_of_qty > 0 ) {
                $is_empty  = false;
                $phrases[] = '<strong>' . ( $lack_of_qty > 1
                ? sprintf(
                    // translators: %1: the lack of quantity
                    __( '%1$s products', 'yay-wholesale' ),
                    esc_html( $lack_of_qty )
                )
                : __( '1 product', 'yay-wholesale' ) ) . '</strong>';
            }

            if ( $lack_of_amt > 0 ) {
                $is_empty  = false;
                $price     = wc_price( $lack_of_amt );
                $phrases[] = "<strong>$price</strong>";
            }

            if ( ! $is_empty ) {
                $lack = implode( ' and ', $phrases );
                $sale = $wholesale['discount'];

                $notice = sprintf(
                    // translators: %1: the lack of quantity
                    __(
                        'You\'re almost there! Add %1$s more to your order and enjoy %2$s each products.',
                        'yay-wholesale'
                    ),
                    $lack,
                    "<span class='ywhs_r_notice'>$sale % Off </span>"
                );
            } else {
                $notice = __( 'Please add items to your cart to receive wholesale pricing.', 'yay-wholesale' );
            }
        }//end if
        ?>
        <div class="ywhs_requirement_section">
            <div class="ywhs_requirement_header">
                <div class="ywhs_requirement_title">
                    <span><?php echo esc_attr_e( 'Wholesale Requirement', 'yay-wholesale' ); ?></span>
                    <span class="ywhs_badge"><?php echo esc_attr( $wholesale['name'] ); ?></span>
                </div>

                <div class="ywhs_requirement_opener ywhs_rclosed"></div>
            </div>
            <div class="ywhs_requirement_notice_section">
                <div class="ywhs_icon_holder">
                    <?php if ( ! $is_discounted ) : ?>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.75 0.75H2.14721L4.00549 9.46581C4.07366 9.78501 4.25047 10.0704 4.50549 10.2727C4.76051 10.4751 5.07778 10.5818 5.40269 10.5746H12.235C12.553 10.5741 12.8613 10.4646 13.109 10.2643C13.3567 10.064 13.5289 9.78478 13.5973 9.47283L14.75 4.25878H2.89471M5.60543 14.0482C5.60543 14.4358 5.29265 14.75 4.90682 14.75C4.521 14.75 4.20822 14.4358 4.20822 14.0482C4.20822 13.6607 4.521 13.3465 4.90682 13.3465C5.29265 13.3465 5.60543 13.6607 5.60543 14.0482ZM13.2901 14.0482C13.2901 14.4358 12.9773 14.75 12.5915 14.75C12.2056 14.75 11.8929 14.4358 11.8929 14.0482C11.8929 13.6607 12.2056 13.3465 12.5915 13.3465C12.9773 13.3465 13.2901 13.6607 13.2901 14.0482Z" 
                            stroke="#2271B1" 
                            stroke-width="1.5" 
                            stroke-linecap="round" 
                            stroke-linejoin="round"/>
                    </svg>
                    <?php else : ?>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.85472 5.64701L5.65601 9.84737M5.65601 5.64701H5.66301M9.85472 9.84737H9.86172M2.05225 5.38105C1.95011 4.92078 1.9658 4.44216 2.09785 3.98957C2.2299 3.53698 2.47405 3.12507 2.80765 2.79203C3.14125 2.459 3.55351 2.21562 4.0062 2.08446C4.45889 1.95331 4.93735 1.93862 5.39723 2.04176C5.65034 1.64574 5.99904 1.31983 6.41118 1.09408C6.82332 0.868329 7.28563 0.75 7.7555 0.75C8.22537 0.75 8.68768 0.868329 9.09982 1.09408C9.51196 1.31983 9.86066 1.64574 10.1138 2.04176C10.5744 1.93817 11.0536 1.95279 11.507 2.08427C11.9605 2.21574 12.3733 2.4598 12.7071 2.79373C13.0409 3.12767 13.2848 3.54064 13.4163 3.99423C13.5477 4.44782 13.5623 4.92729 13.4587 5.38805C13.8546 5.64127 14.1804 5.99011 14.4061 6.40241C14.6317 6.8147 14.75 7.2772 14.75 7.74726C14.75 8.21731 14.6317 8.67981 14.4061 9.09211C14.1804 9.50441 13.8546 9.85324 13.4587 10.1065C13.5618 10.5665 13.5472 11.0452 13.4161 11.498C13.285 11.9509 13.0417 12.3633 12.7088 12.6971C12.3759 13.0308 11.9641 13.275 11.5117 13.4071C11.0593 13.5392 10.5809 13.5549 10.1208 13.4527C9.86798 13.8503 9.51901 14.1776 9.10617 14.4044C8.69333 14.6311 8.22997 14.75 7.759 14.75C7.28803 14.75 6.82466 14.6311 6.41183 14.4044C5.99899 14.1776 5.65001 13.8503 5.39723 13.4527C4.93735 13.5559 4.45889 13.5412 4.0062 13.4101C3.55351 13.2789 3.14125 13.0355 2.80765 12.7025C2.47405 12.3694 2.2299 11.9575 2.09785 11.5049C1.9658 11.0524 1.95011 10.5737 2.05225 10.1135C1.65335 9.86091 1.32477 9.51153 1.09708 9.09782C0.869396 8.68412 0.75 8.21952 0.75 7.74726C0.75 7.27499 0.869396 6.8104 1.09708 6.39669C1.32477 5.98298 1.65335 5.6336 2.05225 5.38105Z" 
                        stroke="#2271B1" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                        />
                    </svg>
                    <?php endif ?>
                </div>

                
                <div class="ywhs_requirement_progress_bar">
                    <div class="ywhs_requirement_notice">
                        <?php echo wp_kses_post( $notice ); ?>
                    </div>
                    <div class="ywhs_r_base_bar">
                        <div class="ywhs_r_value_bar" style="width: <?php echo esc_html( $progress ); ?>%;"></div>
                    </div>
                </div>
            </div>
            <div class="ywhs_requirement_content" style="display: none;">
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $count > 0 ? 'class="ywhs_r_notice"' : '' ); ?>>
                            <?php echo esc_html( $count ); ?>
                        </span> /<?php echo esc_html( $wholesale['minOrderQuantity'] ); ?> </span>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $actual_subtotal > 0 ? 'class="ywhs_r_notice"' : '' ); ?>>
                            <?php echo wp_kses_post( wc_price( $actual_subtotal ) ); ?>
                        </span> /<?php echo wp_kses_post( wc_price( $wholesale['minOrderAmount'] ) ); ?> </span>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Get discount:', 'yay-wholesale' ); ?></span>
                    <div <?php echo wp_kses_post( $is_discounted ? 'class="ywhs_r_notice"' : 'class="ywhs_r_base_notice"' ); ?>><?php echo esc_attr( str_replace( '%DISCOUNT%', $wholesale['discount'], __( '%DISCOUNT%% Off', 'yay-wholesale' ) ) ); ?></div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue the JSX of requirement to Frontend block (Cart, Checkout) using Fill/Slot
     */
    public function enqueue_wholesale_requirement() {
        if ( ( function_exists( 'is_checkout' ) && is_checkout() ) ||
            ( function_exists( 'is_cart' ) && is_cart() ) ) {
            $wholesale = RolesHelper::is_wholesale_user();
            $slug      = 'ywhs_wholesale_requirement';
            $asset     = include YAY_WHOLESALE_PLUGIN_DIR . 'assets/dist/blocks/requirement-slot-fill/index.asset.php';
            wp_enqueue_script(
                $slug,
                YAY_WHOLESALE_PLUGIN_URL . 'assets/dist/blocks/requirement-slot-fill/index.js',
                $asset['dependencies'],
                YAY_WHOLESALE_VERSION,
                true
            );

            remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            remove_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            remove_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

            $price_map = [];
            $cart      = WC()->cart->get_cart();
            foreach ( $cart as $cart_item ) {
                $product_id               = ! empty( $cart_item['variation_id'] ) ? $cart_item['variation_id'] : $cart_item['product_id'];
                $product                  = wc_get_product( $product_id );
                $price_map[ $product_id ] = $product->get_price();
            }

            add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            add_filter( 'woocommerce_product_variation_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
            add_filter( 'woocommerce_variation_prices_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

            wp_localize_script(
                $slug,
                'ywhsRequirement',
                [
                    'wholesale'     => $wholesale,
                    'priceMap'      => $price_map,
                    'currency_data' => [
                        'currency'     => get_woocommerce_currency(),
                        'symbol'       => html_entity_decode( \get_woocommerce_currency_symbol(), ENT_COMPAT ),
                        'position'     => get_option( 'woocommerce_currency_pos' ),
                        'thousand_sep' => get_option( 'woocommerce_price_thousand_sep' ),
                        'decimal_sep'  => get_option( 'woocommerce_price_decimal_sep' ),
                        'num_decimals' => intval( get_option( 'woocommerce_price_num_decimals' ) ),
                    ],
                ]
            );
        }//end if
    }

    public function create_block_requirement_block_init() {
        $block_json_path = YAY_WHOLESALE_PLUGIN_DIR . 'assets/dist/blocks/requirement-block/block.json';

        if ( ! file_exists( $block_json_path ) ) {
            return;
        }

        register_block_type(
            $block_json_path,
            []
        );
    }
}
