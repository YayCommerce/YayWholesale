<?php
namespace YayWholesaleB2B\Pro\Engine\Frontend;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Pro\Helpers\TemplatesHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Requirement Progress feature
 */
class Requirement {
    use SingletonTrait;

    protected function __construct() {
            // --- WooCommerce hooks ---

        if ( ! CustomerHelper::is_current_wholesale_customer() ) {
            return;
        }

        // Legacy
        add_action( 'woocommerce_widget_shopping_cart_before_buttons', [ $this, 'add_yay_wholesale_requirement' ], 999, 0 );
        add_action( 'woocommerce_before_cart_totals', [ $this, 'add_yay_wholesale_requirement' ], 999, 0 );
        add_action( 'woocommerce_review_order_before_payment', [ $this, 'add_yay_wholesale_requirement' ], 999, 0 );

        // Block
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_yay_wholesale_requirement' ], 999 );
        add_action( 'init', [ $this, 'create_ywhs_requirement_block_init' ], 999 );
        add_filter( 'render_block_woocommerce/mini-cart-footer-block', [ $this, 'automatically_add_ywhs_to_mini_cart' ], 999 );

        // Ajax
        add_action( 'wp_ajax_ywhs_get_original_price_in_cart', [ $this, 'ywhs_get_original_price_in_cart' ] );
        add_action( 'wp_ajax_nopriv_ywhs_get_original_price_in_cart', [ $this, 'ywhs_get_original_price_in_cart' ] );
    }

    /**
     * Render the html of requirement to Frontend block (Mini cart) using action hook
     */
    public function add_yay_wholesale_requirement() {

        $wholesale = CustomerHelper::get_current_user_wholesale_role();

        if ( ! $wholesale ) {
            return;
        }

        $min_order_quantity = RequirementHelper::get_min_order_quantity( $wholesale );
        $min_order_amount   = RequirementHelper::get_min_order_amount( $wholesale );

        $is_hidden_quantity = 0.0 === (float) $min_order_quantity;
        $is_hidden_amount   = 0.0 === (float) $min_order_amount;

        // if ( $is_hidden_quantity && $is_hidden_amount ) {
        // return;
        // }

        $is_discounted   = isset( $wholesale ) && RequirementHelper::is_cart_meet_requirement( $wholesale );
        $actual_subtotal = RequirementHelper::calc_actual_subtotal_of_cart();
        $count           = WC()->cart->get_cart_contents_count();
        $lack_of_amt     = 0;
        $lack_of_qty     = 0;

        if ( $is_discounted ) {
            $notice   = __( "Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉", 'yay-wholesale-b2b' );
            $progress = 100;
        } else {
            $lack_of_amt     = $min_order_amount - $actual_subtotal;
            $lack_of_qty     = $min_order_quantity - $count;
            $progress_of_amt = min( 100, $actual_subtotal / max( $min_order_amount, 1 ) * 100 );
            $progress_of_qty = min( 100, $count / max( $min_order_quantity, 1 ) * 100 );

            $progress = number_format( ( ( $progress_of_amt + $progress_of_qty ) / 2 ), 2 );

            $is_empty = true;
            $phrases  = [];

            if ( $lack_of_qty > 0 && $lack_of_qty < $min_order_quantity ) {
                $is_empty  = false;
                $phrases[] = '<strong>' . ( $lack_of_qty > 1
                ? sprintf(
                    // translators: %1: the lack of quantity
                    __( '%1$s products', 'yay-wholesale-b2b' ),
                    esc_html( $lack_of_qty )
                )
                : __( '1 product', 'yay-wholesale-b2b' ) ) . '</strong>';
            }

            if ( $lack_of_amt > 0 && $lack_of_amt < $min_order_amount ) {
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
                        'You\'re almost there! Add %1$s more to receive wholesale pricing with %2$s value.',
                        'yay-wholesale-b2b'
                    ),
                    $lack,
                    "<span class='ywhs_r_notice'>$sale % Off </span>"
                );
            } else {
                $notice = __( 'Please add items to your cart to receive wholesale pricing.', 'yay-wholesale-b2b' );
            }
        }//end if
        ?>
        <div class="ywhs_requirement_section">
            <div class="ywhs_requirement_header">
                <div class="ywhs_requirement_title">
                    <span><?php echo esc_attr_e( 'Wholesale Requirement', 'yay-wholesale-b2b' ); ?></span>
                    <span class="ywhs_badge"><?php echo esc_attr( $wholesale['name'] ); ?></span>
                </div>

                <div class="ywhs_requirement_opener ywhs_rclosed"></div>
            </div>
            <div class="ywhs_requirement_notice_section">
                <div class="ywhs_icon_holder">
                    <?php if ( ! $is_discounted ) : ?>
                        <img src="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/cart.svg' ) ); ?>" width="14" height="14"/>
                    <?php else : ?>
                        <img src="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/discount.svg' ) ); ?>" width="14" height="14"/>
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
                <?php if ( ! $is_hidden_quantity ) : ?>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale-b2b' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $is_discounted ? 'class="ywhs_r_notice"' : '' ); ?>>
                            <?php echo esc_html( $count ); ?>
                        </span> /<?php echo esc_html( $min_order_quantity ); ?> </span>
                </div>
                <?php endif ?>

                <?php if ( ! $is_hidden_amount ) : ?>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale-b2b' ); ?></span>
                    <span class="ywhs_r_base_notice">
                        <span <?php echo wp_kses_post( $is_discounted ? 'class="ywhs_r_notice"' : '' ); ?>>
                            <?php echo wp_kses_post( wc_price( $actual_subtotal ) ); ?>
                        </span> /<?php echo wp_kses_post( wc_price( $min_order_amount ) ); ?> </span>
                </div>
                <?php endif ?>

                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Get discount:', 'yay-wholesale-b2b' ); ?></span>
                    <div <?php echo wp_kses_post( $is_discounted ? 'class="ywhs_r_notice"' : 'class="ywhs_r_base_notice"' ); ?>><?php echo esc_attr( str_replace( '%DISCOUNT%', $wholesale['discount'], __( '%DISCOUNT%% Off', 'yay-wholesale-b2b' ) ) ); ?></div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue the JSX of requirement to Frontend block (Cart, Checkout) using Fill/Slot
     */
    public function enqueue_yay_wholesale_requirement() {
        if ( ( function_exists( 'is_checkout' ) && is_checkout() ) ||
            ( function_exists( 'is_cart' ) && is_cart() ) ) {

            // var_dump( wp_is_block_theme() );
            if ( ! TemplatesHelper::is_requirement_enabled_in_cart() ) {
                return;
            }

            $wholesale = CustomerHelper::get_current_user_wholesale_role();
            $slug      = 'ywhs_wholesale_requirement';
            $asset     = include YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/dist/blocks/requirement-slot-fill/index.asset.php';
            wp_enqueue_script(
                $slug,
                YAYWHOLESALEB2B_PLUGIN_URL . 'assets/dist/blocks/requirement-slot-fill/index.js',
                $asset['dependencies'],
                YAYWHOLESALEB2B_VERSION,
                true
            );

            $price_map = [];
            $cart      = WC()->cart->get_cart();

            foreach ( $cart as $cart_item_key => $cart_item ) {
                $product = wc_get_product( $cart_item['data']->get_id() );
                $extra   = apply_filters( 'ywhs_cart_item_extra_price_before_apply_discount', 0, $cart_item );

                $extra                       = apply_filters( 'ywhs_after_calc_price_additional_processed', $extra, null, $wholesale );
                $price_map[ $cart_item_key ] = wc_get_price_excluding_tax( $product ) + $extra;

            }

            $wholesale['minOrderQuantity'] = RequirementHelper::get_min_order_quantity( $wholesale );
            $wholesale['minOrderAmount']   = RequirementHelper::get_min_order_amount( $wholesale );

            wp_localize_script(
                $slug,
                'ywhsRequirement',
                [
                    'wholesale' => $wholesale,
                    'priceMap'  => $price_map,
                    'pluginUrl' => YAYWHOLESALEB2B_PLUGIN_URL,
                ]
            );
        }//end if
    }

    /**
     * Register new block type of Wholesale Requirement
     */
    public function create_ywhs_requirement_block_init() {
        $block_json_path = YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/dist/blocks/requirement-block/block.json';

        if ( ! file_exists( $block_json_path ) ) {
            return;
        }

        register_block_type(
            $block_json_path,
            []
        );
    }

    /**
     * Automatically add requirement block to mini cart block of woocommerce
     *
     * @param string $block_content The default HTML of mini-cart block.
     */
    public function automatically_add_ywhs_to_mini_cart( $block_content ) {
        // Your custom block HTML
        $custom_block         = '<!-- wp:yay-wholesale/requirement-block /-->';
        $custom_block_content = do_blocks( $custom_block );

        return $custom_block_content . $block_content;
    }

    /**
     * Return an originale price (before discount) map of each line item in cart
     */
    public function ywhs_get_original_price_in_cart() {
        $raw  = file_get_contents( 'php://input' );
        $data = json_decode( wp_unslash( $raw ), true );

        if ( ! isset( $data['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $data['nonce'] ) ), 'get_original_price_in_cart' ) ) {
            wp_send_json_error( 'Invalid nonce' );
        }

        if ( is_null( WC()->cart ) ) {
            wc_load_cart();
        }

        $cart = WC()->cart->get_cart();

        $price_map = [];

        foreach ( $cart as $cart_item_key => $cart_item ) {
            $product = wc_get_product( $cart_item['data']->get_id() );
            $extra   = apply_filters( 'ywhs_cart_item_extra_price_before_apply_discount', 0, $cart_item );

            $extra                       = apply_filters( 'ywhs_after_calc_price_additional_processed', $extra, null, null );
            $price_map[ $cart_item_key ] = wc_get_price_excluding_tax( $product ) + $extra;
        }

        wp_send_json_success( $price_map );
    }
}
