<?php
namespace Yay_Wholesale\Engine\Admin;

use WC_Data_Store;
use WC_Tax;
use Yay_Wholesale\Engine\Frontend\Pricing;
use Yay_Wholesale\Engine\Frontend\Tax;
use Yay_Wholesale\Helpers\RolesHelper;
use Yay_Wholesale\Helpers\SettingsHelper;
use Yay_Wholesale\Helpers\PricingHelper;
use Yay_Wholesale\Helpers\ReportsHelper;
use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Admin WC Orders Page
 */
class Orders {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'woocommerce_order_before_calculate_totals', [ $this, 'admin_recalculate_order' ], 999, 2 );

        add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'admin_wc_orders_wholesale_filter_html' ], 10, 1 );

        add_filter( 'woocommerce_order_query', [ $this, 'admin_wc_orders_wholesale_filtered' ], 999, 2 );

        add_filter( 'woocommerce_shop_order_list_table_columns', [ $this, 'edit_shop_order_columns' ], 999, 1 );

        add_action( 'woocommerce_shop_order_list_table_custom_column', [ $this, 'shop_order_custom_column' ], 999, 2 );
    }

    /**
     * Set the order data discounted when the admin recalculates orders
     *
     * @param bool      $and_taxes the taxes included flag.
     * @param \WC_Order $order The cart object.
     */
    public function admin_recalculate_order( $and_taxes, \WC_Order $order ) {
        $customer_id       = $order->get_customer_id();
        $is_wholesale_user = RolesHelper::is_wholesale_user( $customer_id );
        $is_disabled_tax   = SettingsHelper::get_settings()['general']['disable_tax'] ?? false;
        $is_removing_tax   = false;
        $items             = [];

        remove_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
        remove_filter( 'woocommerce_calc_tax', [ Tax::get_instance(), 'maybe_disable_tax_calc' ], 9999 );

        $quantity = $order->get_item_count();
        $subtotal = 0;
        // Calculate the subtotal with original unit price
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }
            $product   = $item->get_product();
            $subtotal += $product->get_price() * $item->get_quantity();
        }
        $is_discounted = isset( $is_wholesale_user ) && PricingHelper::meets_discount_conditions( $is_wholesale_user, $quantity, $subtotal );

        // Force tax exempted (default is the value of 'is_vat_exempt' in meta_data of order)
        $is_force_tax_exempt = apply_filters( 'woocommerce_order_is_vat_exempt', 'yes' === $order->get_meta( 'is_vat_exempt' ), $order );

        // Update the price of order items
        foreach ( $order->get_items() as $item ) {
            if ( ! $item instanceof \WC_Order_Item_Product ) {
                continue;
            }

            $product   = $item->get_product();
            $new_price = $product->get_price();

            if ( $is_discounted ) {
                $new_price = PricingHelper::calc_discounted_price( $new_price, $is_wholesale_user, $product );
            }

            $quantity = $item->get_quantity();
            $item->set_subtotal( $new_price * $quantity );
            $item->set_total( $new_price * $quantity );
            $items[] = $item->get_name() . ' x ' . $quantity;

            if ( ( $is_discounted && $is_disabled_tax ) ||
            ( ! $is_discounted && $is_force_tax_exempt ) ) {
                $item->set_taxes(
                    [
                        'total'    => [],
                        'subtotal' => [],
                    ]
                );
                $is_removing_tax = true;
            } else {
                $tax_rates = WC_Tax::get_rates( $item->get_tax_class() );
                $taxes     = WC_Tax::calc_tax( $new_price * $quantity, $tax_rates, false );
                $item->set_taxes(
                    [
                        'total'    => $taxes,
                        'subtotal' => $taxes,
                    ]
                );
            }//end if
        }//end foreach

        // update "Items" displaying in shipping items
        foreach ( $order->get_items( 'shipping' ) as $shipping ) {
            $shipping->update_meta_data( 'Items', implode( ', ', $items ) );

            if ( ! $shipping instanceof \WC_Order_Item_Shipping ) {
                continue;
            }

            if ( ( $is_discounted && $is_disabled_tax ) ||
            ( ! $is_discounted && $is_force_tax_exempt ) ) {
                $shipping->set_taxes( [] );
            } else {
                $tax_rates = WC_Tax::get_shipping_tax_rates( $shipping->get_tax_class() );
                $taxes     = WC_Tax::calc_tax( $shipping->get_total(), $tax_rates, false );
                $shipping->set_taxes(
                    [
                        'total'    => $taxes,
                        'subtotal' => $taxes,
                    ]
                );
            }//end if
        }//end foreach

        // Update taxes
        $order->update_taxes();
        if ( $is_removing_tax ) {
            $order->remove_order_items( 'tax' );
        }

        $trigger_email = false;

        // Update meta data for filter
        if ( $is_discounted ) {
            $tmp = $order->get_meta( '_ywhs_wholesale_role' );
            if ( ! isset( $tmp ) ) {
                $trigger_email = true;
            }

            if ( $tmp !== $is_wholesale_user['name'] ) {
                $order->update_meta_data( '_ywhs_wholesale_role', $is_wholesale_user['name'] );
            }
        } else {
            $order->delete_meta_data( '_ywhs_wholesale_role' );
        }

        if ( $trigger_email ) {
            do_action( 'yhs_new_order_placed', $order->get_id(), $order );
        }

        $default_range_transient = get_transient( ReportsHelper::REPORT_DATE_RANGE_TRANSIENT );
        if ( false !== $default_range_transient ) {
            $transient_key = ReportsHelper::REPORT_TRANSIENT
                            . '_'
                            . $default_range_transient['default_compare_start_date']
                            . '_'
                            . $default_range_transient['default_compare_end_date']
                            . '_'
                            . $default_range_transient['default_start_date']
                            . '_'
                            . $default_range_transient['default_end_date'];

            delete_transient( $transient_key );
        }

        add_filter( 'woocommerce_product_get_price', [ Pricing::get_instance(), 'get_price' ], 99, 2 );
        add_filter( 'woocommerce_calc_tax', [ Tax::get_instance(), 'maybe_disable_tax_calc' ], 9999 );
    }//end admin_recalculate_order()

    /**
     * Add the wholesale and retail order filter to admin WC order list page
     *
     * @param string $order_type  The order type.
     */
    public function admin_wc_orders_wholesale_filter_html( $order_type ) {
        if ( 'shop_order' !== $order_type ) {
            return;
        }

        $filter = filter_input( INPUT_GET, '_ywhs_order_type' );
        $value  = isset( $filter ) ? $filter : 'all';
        ?>
        <select name="_ywhs_order_type">
            <option value="all"><?php echo esc_html__( 'All Wholesale and Retail', 'yay-wholesale' ); ?></option>
            <option value="wholesale" <?php selected( $value, 'wholesale' ); ?>><?php echo esc_html__( 'Only Wholesale', 'yay-wholesale' ); ?></option>
            <option value="retail" <?php selected( $value, 'retail' ); ?>><?php echo esc_html__( 'Only Retail', 'yay-wholesale' ); ?></option>
        </select>
        <?php
    }

    /**
     * Filter WC Orders data by yay wholesaler role
     *
     * @param array $result The WC default result.
     * @param array $args The arguments.
     */
    public function admin_wc_orders_wholesale_filtered( $result, $args ) {
        $order_type = filter_input( INPUT_GET, '_ywhs_order_type' );

        if ( ! isset( $order_type ) || 'all' === $order_type ) {
            return $result;
        }

        if ( 'wholesale' === $order_type ) {
            $args['meta_key'] = '_ywhs_wholesale_role';
        } elseif ( 'retail' === $order_type ) {
            $args['meta_query'][] = [
                'key'     => '_ywhs_wholesale_role',
                'compare' => 'NOT EXISTS',
            ];
        }

        $result = WC_Data_Store::load( 'order' )->query( $args );

        return $result;
    }

    /**
     * Add the custom columns: Order Type
     *
     * @param array $columns The initial columns list.
     * @return array The customized columns list.
     */
    public function edit_shop_order_columns( $columns ) {
        $columns['ywhs_order_type'] = __( 'Order Type', 'yay-wholesale' );
        return $columns;
    }

    /**
     * Add the rendering for custom columns: Order Type
     *
     * @param string    $column  The key of column.
     * @param \WC_Order $order The current order item row.
     */
    public function shop_order_custom_column( $column, \WC_Order $order ) {
        if ( 'ywhs_order_type' !== $column ) {
            return;
        }

        $is_wholesale_order = (bool) $order->get_meta( '_ywhs_wholesale_role' );
        ?>
        <div class="ywhs_order_type_badge <?php echo $is_wholesale_order ? 'ywhs_order_type_wholesale' : 'ywhs_order_type_retail'; ?>" >
            <span>
                <?php
                if ( $is_wholesale_order ) {
                    echo esc_attr_e( 'Wholesale', 'yay-wholesale' );
                } else {
                    echo esc_attr_e( 'Retail', 'yay-wholesale' );
                }
                ?>
            </span>
        </div>
        <?php
    }
}
