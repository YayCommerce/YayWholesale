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

        $is_discounted = isset( $wholesale ) && PricingHelper::meets_discount_conditions( $wholesale );

        ?>
        <div class="ywhs_requirement_section">
            <div class="ywhs_requirement_title"><?php echo esc_attr( str_replace( '%ROLE_NAME%', $wholesale['name'], __( 'Wholesale Requirement: %ROLE_NAME%', 'yay-wholesale' ) ) ); ?></div>
            <div class="ywhs_requirement_content">
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min Order Quantity:', 'yay-wholesale' ); ?></span>
                    <span><?php echo esc_html( WC()->cart->get_cart_contents_count() ); ?> / <?php echo esc_html( $wholesale['minOrderQuantity'] ); ?> </span>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Min Order Amount:', 'yay-wholesale' ); ?></span>
                    <span><?php echo wp_kses_post( wc_price( PricingHelper::calc_actual_subtotal_of_cart() ) ); ?> / <?php echo wp_kses_post( wc_price( $wholesale['minOrderAmount'] ) ); ?> </span>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Discount:', 'yay-wholesale' ); ?></span>
                    <div><?php echo esc_attr( str_replace( '%DISCOUNT%', $wholesale['discount'], __( '%DISCOUNT%% Per Product', 'yay-wholesale' ) ) ); ?></div>
                </div>
                <div class="ywhs_requirement_item">
                    <span><?php echo esc_attr_e( 'Status:', 'yay-wholesale' ); ?></span>
                    <?php if ( $is_discounted ) : ?>
                        <div class="ywhs_rbadge ywhs_rb_qualified"><?php echo esc_attr_e( 'Qualified', 'yay-wholesale' ); ?></div>
                    <?php else : ?>
                        <div class="ywhs_rbadge ywhs_rb_not_qualified"><?php echo esc_attr_e( 'Not Qualified', 'yay-wholesale' ); ?></div>
                    <?php endif ?>
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
                wp_enqueue_script(
                    $slug,
                    YAY_WHOLESALE_PLUGIN_URL . 'assets/js/wholesale-requirement-slot.js',
                    [ 'wp-plugins', 'wp-element', 'wp-components', 'wp-i18n' ],
                    YAY_WHOLESALE_VERSION,
                    true
                );

                wp_localize_script(
                    $slug,
                    'ywhsRequirement',
                    [
                        'wholesale'    => $wholesale,
                        'cartCount'    => WC()->cart->get_cart_contents_count(),
                        'minCount'     => wc_price( $wholesale['minOrderAmount'] ),
                        'cartSubtotal' => wc_price( PricingHelper::calc_actual_subtotal_of_cart() ) ,
                        'isDiscounted' => isset( $wholesale ) && PricingHelper::meets_discount_conditions( $wholesale ),
                    ]
                );
        }//end if
    }
}
