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

        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_wholesale_requirement' ], 999 );
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
            <div class="ywhs_requirement_progress_bar">
                <div class="ywhs_requirement_notice">
                    <?php echo wp_kses_post( $notice ); ?>
                </div>
                <div class="ywhs_r_base_bar">
                    <div class="ywhs_r_value_bar" style="width: <?php echo esc_html( $progress ); ?>%;"></div>
                </div>
            </div>
            <div class="ywhs_requirement_content" style="display: none;">
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $lack_of_qty <= 0 ? 'class="ywhs_r_notice"' : '' ); ?>>
                            <?php echo esc_html( $count ); ?>
                        </span> /<?php echo esc_html( $wholesale['minOrderQuantity'] ); ?> </span>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $lack_of_amt <= 0 ? 'class="ywhs_r_notice"' : '' ); ?>>
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
                $asset     = include __DIR__ . '/../../../assets/dist/blocks/requirement-slot-fill/index.asset.php';
                wp_enqueue_script(
                    $slug,
                    YAY_WHOLESALE_PLUGIN_URL . 'assets/dist/blocks/requirement-slot-fill/index.js',
                    $asset['dependencies'],
                    YAY_WHOLESALE_VERSION,
                    true
                );

                remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

                $price_map = [];
                $cart      = WC()->cart->get_cart();
            foreach ( $cart as $cart_item ) {
                $product                               = wc_get_product( $cart_item['product_id'] );
                $price_map[ $cart_item['product_id'] ] = $product->get_price();
            }

                add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );

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
}
