<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Helpers\HooksHelper;
use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\PricingHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Utils\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Admin WC Orders Page
 */
class Orders {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'woocommerce_order_before_calculate_totals', [ $this, 'ywhs_before_calculate_order' ], 999, 2 );

        add_filter( 'woocommerce_order_is_vat_exempt', [ $this, 'ywhs_tax_enabled_handler' ], 999, 2 );

        add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'ywhs_admin_wc_orders_wholesale_filter_html' ], 10, 1 );

        add_filter( 'woocommerce_order_query_args', [ $this, 'ywhs_admin_wc_orders_wholesale_filtered' ], 999, 1 );

        add_filter( 'woocommerce_shop_order_list_table_columns', [ $this, 'ywhs_edit_shop_order_columns' ], 999, 1 );

        add_action( 'woocommerce_shop_order_list_table_custom_column', [ $this, 'ywhs_shop_order_custom_column' ], 999, 2 );
    }

    /**
     * Set the order data discounted when the admin recalculates orders or new order has just created
     *
     * @param bool      $and_taxes the taxes included flag.
     * @param \WC_Order $order The order object.
     */
    public function ywhs_before_calculate_order( $and_taxes, \WC_Order $order ) {

        $customer_id        = $order->get_customer_id();
        $wholesale_role     = RolesHelper::is_wholesale_user( $customer_id );
        $setting            = SettingsHelper::get_settings();
        $is_disabled_coupon = $setting['general']['disable_coupon'] ?? false;
        $items              = [];

        if ( ! isset( $wholesale_role ) ) {
            return;
        }

        $is_discounted = PricingHelper::check_is_discounted( $order, $wholesale_role );

        $this->calculate_price_of_items(
            $order,
            $is_discounted,
            $is_disabled_coupon,
            $wholesale_role,
            $items
        );

        // Update meta data for filter
        if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
            PricingHelper::handle_order( $order, $wholesale_role, $is_discounted );
        }
    }//end ywhs_before_calculate_order()

    /**
     * Handle the status of tax exemption
     *
     * @param bool      $is_exempt the default flag.
     * @param \WC_Order $order The order object.
     */
    public function ywhs_tax_enabled_handler( bool $is_exempt, \WC_Order $order ) {
        if ( ! is_admin() ) {
            return $is_exempt;
        }

        $customer_id     = $order->get_customer_id();
        $wholesale_role  = RolesHelper::is_wholesale_user( $customer_id );
        $setting         = SettingsHelper::get_settings();
        $is_disabled_tax = $setting['general']['disable_tax'] ?? false;

        if ( ! isset( $wholesale_role ) ) {
            return $is_exempt;
        }

        $is_discounted = PricingHelper::check_is_discounted( $order, $wholesale_role );
        if ( $is_discounted && $is_disabled_tax ) {
            return true;
        }

        return $is_exempt;
    }

    /**
     * Calculate the final price and tax of order items
     *
     * @param \WC_Order $order the order object.
     * @param bool      $is_discounted the status of order that meet the discount requirement.
     * @param bool      $is_disabled_coupon the disabled coupon setting.
     * @param array     $wholesale_role wholesale role of owner.
     * @param array     $items the items array to statistic items in order.
     */
    protected function calculate_price_of_items(
        \WC_Order $order,
        bool $is_discounted,
        bool $is_disabled_coupon,
        array $wholesale_role,
        array &$items
    ) {
        $coupons         = $order->get_items( 'coupon' );
        $extra_price_map = $order->get_meta( '_ywhs_extra_price_map' );

        if ( ! is_array( $extra_price_map ) ) {
            $extra_price_map = [];
        }

        $discounted_coupon = 0;
        if ( $is_discounted && $is_disabled_coupon ) {
            $order->remove_order_items( 'coupon' );
        } else {
            foreach ( $coupons as $coupon_item ) {
                /** @var WC_Order_Item_Coupon $coupon_item */

                $code   = $coupon_item->get_code();
                $amount = $coupon_item->get_discount();

                $discounted_coupon += $amount;
            }
        }

        // Handeling price and tax
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }

            $quantity = $item->get_quantity();
            $product  = $item->get_product();
            if ( is_admin() ) {
                $extra = $extra_price_map[ $item->get_id() ] ?? 0;

                HooksHelper::remove_price_hooks();

                $price = $product->get_price();
                if ( is_ajax() ) {
                    $price = apply_filters( 'ywhs_product_price_ajax_handled', $price, $product, 'price' );
                }
                HooksHelper::add_price_hooks();

                $price = apply_filters( 'ywhs_convert_price_from_order', $price, $order, false );

                $price     = wc_get_price_excluding_tax( $product, [ 'price' => $price ] );
                $new_price = $price + $extra;

                if ( $is_discounted ) {
                    $new_price = PricingHelper::calc_discounted_price( $new_price, $wholesale_role, $product, $extra );
                }

                $item->set_subtotal( $new_price * $quantity );
                $item->set_total( $new_price * $quantity - $discounted_coupon );
            }//end if

            $items[] = $item->get_name() . ' x ' . $quantity;
        }//end foreach
    }//end calculate_price_of_items()

    /**
     * Add the wholesale and retail order filter to admin WC order list page
     *
     * @param string $order_type  The order type.
     */
    public function ywhs_admin_wc_orders_wholesale_filter_html( $order_type ) {
        if ( 'shop_order' !== $order_type ) {
            return;
        }

        $filter = filter_input( INPUT_GET, '_ywhs_order_type', FILTER_SANITIZE_SPECIAL_CHARS );
        $value  = isset( $filter ) ? $filter : 'all';
        ?>
        <select name="_ywhs_order_type">
            <option value="all"><?php echo esc_html__( 'All Wholesale and Retail', 'yay-wholesale-b2b' ); ?></option>
            <option value="wholesale" <?php selected( $value, 'wholesale' ); ?>><?php echo esc_html__( 'Only Wholesale', 'yay-wholesale-b2b' ); ?></option>
            <option value="retail" <?php selected( $value, 'retail' ); ?>><?php echo esc_html__( 'Only Retail', 'yay-wholesale-b2b' ); ?></option>
        </select>
        <?php
    }

    /**
     * Filter WC Orders data by yay wholesaler role
     *
     * @param array $args The arguments.
     */
    public function ywhs_admin_wc_orders_wholesale_filtered( $args ) {
        $order_type = filter_input( INPUT_GET, '_ywhs_order_type', FILTER_SANITIZE_SPECIAL_CHARS );

        // Link from dashboard
        $start_date = filter_input( INPUT_GET, '_ywhs_order_from', FILTER_SANITIZE_SPECIAL_CHARS );
        $end_date   = filter_input( INPUT_GET, '_ywhs_order_to', FILTER_SANITIZE_SPECIAL_CHARS );

        $date_query  = [];
        $blank_count = 0;
        if ( Utils::is_valid_date_format( $start_date ) ) {
            $date_query[] = $start_date;
        } else {
            $date_query[] = '';
            ++$blank_count;
        }

        if ( Utils::is_valid_date_format( $end_date ) ) {
            $date_query[] = $end_date;
        } else {
            $date_query[] = '';
            ++$blank_count;
        }

        if ( $blank_count < 2 ) {
            $args['date_created'] = implode( '...', $date_query );
        }

        if ( ! isset( $order_type ) || 'all' === $order_type ) {
            return $args;
        }

        if ( 'wholesale' === $order_type ) {
            $args['meta_key'] = '_ywhs_wholesale_role';
        } elseif ( 'retail' === $order_type ) {
            $args['meta_query'][] = [
                'key'     => '_ywhs_wholesale_role',
                'compare' => 'NOT EXISTS',
            ];
        }//end if

        return $args;
    }

    /**
     * Add the custom columns: Order Type
     *
     * @param array $columns The initial columns list.
     * @return array The customized columns list.
     */
    public function ywhs_edit_shop_order_columns( $columns ) {
        $columns['ywhs_order_type'] = __( 'Order Type', 'yay-wholesale-b2b' );
        return $columns;
    }

    /**
     * Add the rendering for custom columns: Order Type
     *
     * @param string    $column  The key of column.
     * @param \WC_Order $order The current order item row.
     */
    public function ywhs_shop_order_custom_column( $column, \WC_Order $order ) {
        if ( 'ywhs_order_type' !== $column ) {
            return;
        }

        $is_wholesale_order = (bool) $order->get_meta( '_ywhs_wholesale_role' );
        ?>
        <div class="ywhs_order_type_badge <?php echo $is_wholesale_order ? 'ywhs_order_type_wholesale' : 'ywhs_order_type_retail'; ?>" >
            <span>
                <?php
                if ( $is_wholesale_order ) {
                    echo esc_attr_e( 'Wholesale', 'yay-wholesale-b2b' );
                } else {
                    echo esc_attr_e( 'Retail', 'yay-wholesale-b2b' );
                }
                ?>
            </span>
        </div>
        <?php
    }
}
