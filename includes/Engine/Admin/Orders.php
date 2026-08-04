<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\PricingHelpers\OrderPricingHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Utils\SingletonTrait;
use YayWholesaleB2B\Utils\Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Admin WC Orders Page
 */
class Orders {
    use SingletonTrait;

    protected bool $is_processing_order_calc;

    protected function __construct() {

        $this->is_processing_order_calc = false;

        // Admin update item | recalculate order
        add_action( 'woocommerce_order_before_calculate_totals', [ $this, 'ajax_update_recalculate_in_admin_order' ], 999, 2 );

        // Admin add item
        add_filter( 'woocommerce_ajax_order_item', [ $this, 'ajax_add_item_in_admin_order' ], 999, 3 );

        // When order is created then handle to update meta data
        add_action( 'woocommerce_new_order', [ $this,'order_meta_handle_after_saved' ], 999, 2 );

        // Tax disabled
        add_filter( 'woocommerce_order_is_vat_exempt', [ $this, 'ywhs_tax_enabled_handler' ], 999, 2 );

        // Admin order filter + display order type field
        add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'ywhs_admin_wc_orders_wholesale_filter_html' ], 10, 1 );

        add_filter( 'woocommerce_order_query_args', [ $this, 'ywhs_admin_wc_orders_wholesale_filtered' ], 999, 1 );

        add_filter( 'woocommerce_shop_order_list_table_columns', [ $this, 'ywhs_edit_shop_order_columns' ], 999, 1 );

        add_action( 'woocommerce_shop_order_list_table_custom_column', [ $this, 'ywhs_shop_order_custom_column' ], 999, 2 );

        // Email
        add_action( 'woocommerce_order_status_changed', [ $this, 'ywhs_send_wholesale_order_email' ], 999, 3 );
    }

    /**
     * Set the order data discounted when the admin recalculates or edit orders
     *
     * @param bool                       $and_taxes the taxes included flag.
     * @param \WC_Order|\WC_Order_Refund $order The order object.
     */
    public function ajax_update_recalculate_in_admin_order( $and_taxes, $order ) {
        // This is only run in admin order editor context
        if ( check_ajax_referer( 'calc-totals', 'security', false ) || check_ajax_referer( 'order-item', 'security', false ) ) {
            // Only handle when order is WC_Order
            if ( ! $order instanceof \WC_Order ) {
                return;
            }

            if ( $this->is_processing_order_calc ) {
                return;
            }

            $this->is_processing_order_calc = true;

            OrderPricingHelper::update_and_recalculate_order( $order );

            $this->is_processing_order_calc = false;
        }
    }

    /**
     * Update the price of item when it's initially added
     *
     * @param \WC_Order_Item             $item The item added.
     * @param int                        $item_id The item id.
     * @param \WC_Order|\WC_Order_Refund $order The order object.
     * @return \WC_Order_Item
     */
    public function ajax_add_item_in_admin_order( $item, $item_id, \WC_Order $order ) {
        check_ajax_referer( 'order-item', 'security' );

        OrderPricingHelper::update_and_recalculate_order( $order );

        $items = array_filter( $order->get_items(), fn( $value ) =>  $value->get_id() === $item_id );

        return $items[ array_key_first( $items ) ] ?? $item;
    }

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

        $customer        = get_user_by( 'ID', $order->get_customer_id() );
        $wholesale_role  = CustomerHelper::get_wholesale_role( $customer );
        $setting         = SettingsHelper::get_settings();
        $is_disabled_tax = $setting['general']['disable_tax'] ?? false;

        if ( ! isset( $wholesale_role ) ) {
            return $is_exempt;
        }

        $is_discounted = RequirementHelper::is_order_meet_requirement( $order, $wholesale_role );
        if ( $is_discounted && $is_disabled_tax ) {
            $order->update_meta_data( 'is_vat_exempt', 'yes' );
            $order->save_meta_data();
            return true;
        }

        $order->update_meta_data( 'is_vat_exempt', 'no' );
        $order->save_meta_data();

        return false;
    }

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
        $start_date        = filter_input( INPUT_GET, '_ywhs_order_from', FILTER_SANITIZE_SPECIAL_CHARS );
        $end_date          = filter_input( INPUT_GET, '_ywhs_order_to', FILTER_SANITIZE_SPECIAL_CHARS );
        $is_from_dashboard = filter_input( INPUT_GET, '_ywhs_from_dashboard', FILTER_SANITIZE_SPECIAL_CHARS );

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

        if ( 'true' === $is_from_dashboard ) {
            $args['status'] = [ 'pending', 'on-hold', 'processing', 'completed' ];
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
        <div class="ywhs_order_type_badge" >
            <span class="<?php echo $is_wholesale_order ? 'ywhs_order_type_wholesale' : 'ywhs_order_type_retail'; ?>">
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

    /**
     * Send wholesale mail by status of order
     *
     * @param mixed  $order_id  The key of column.
     * @param string $old_status The status before changed.
     * @param string $new_status The status after changed.
     */
    public function ywhs_send_wholesale_order_email( $order_id, $old_status, $new_status ) {
        $order            = wc_get_order( $order_id );
        $email_trigger    = (int) $order->get_meta( '_ywhs_wholesale_email_trigger' );
        $permitted_status = apply_filters( 'ywhs_permitted_status_for_wholesale_order_email', [ 'on-hold', 'processing', 'completed' ] );

        if ( ( 'cancelled' === $old_status || $email_trigger < 1 ) && in_array( $new_status, $permitted_status, true ) ) {
            do_action( 'ywhs_new_wholesale_order_placed', $order_id, $order );
            $order->update_meta_data( '_ywhs_wholesale_email_trigger', ++$email_trigger );
            $order->save_meta_data();
        }
    }

    /**
     * Run when order has just been placed from the checkout hook
     *
     * @param int       $order_id The order object.
     * @param array     $posted_data the data object.
     * @param \WC_Order $order The order object.
     */
    public function order_meta_handle_after_saved( $order_id, $order ) {
        $customer       = get_user_by( 'ID', $order->get_customer_id() );
        $wholesale_role = CustomerHelper::get_wholesale_role( $customer );
        if ( ! isset( $wholesale_role ) ) {
            return;
        }

        $wholesale_role['minOrderAmount']   = RequirementHelper::get_min_order_amount( $wholesale_role );
        $wholesale_role['minOrderQuantity'] = RequirementHelper::get_min_order_quantity( $wholesale_role );

        $is_discounted = RequirementHelper::is_order_meet_requirement( $order, $wholesale_role );

        OrderPricingHelper::handle_order_type_meta( $order, $wholesale_role, $is_discounted );
        OrderPricingHelper::handle_order_item_extra_price_map( $order, $wholesale_role, $is_discounted );
    }
}
