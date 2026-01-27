<?php
namespace Yay_Wholesale_B2B\Engine\Admin;

use WC_Data_Store;
use WC_Tax;
use Yay_Wholesale_B2B\Engine\Compatibles;
use Yay_Wholesale_B2B\Engine\Frontend\Tax;
use Yay_Wholesale_B2B\Helpers\RolesHelper;
use Yay_Wholesale_B2B\Helpers\SettingsHelper;
use Yay_Wholesale_B2B\Helpers\PricingHelper;
use Yay_Wholesale_B2B\Utils\SingletonTrait;

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

        add_filter( 'woocommerce_order_query', [ $this, 'ywhs_admin_wc_orders_wholesale_filtered' ], 999, 2 );

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

        remove_filter( 'woocommerce_order_is_vat_exempt', [ $this, 'ywhs_tax_enabled_handler' ], 999, 2 );
        remove_filter( 'woocommerce_calc_tax', [ Tax::get_instance(), 'ywhs_maybe_disable_tax_calc' ], 9999 );
        Compatibles::get_instance()->remove_price_related_hooks();

        $customer_id        = $order->get_customer_id();
        $wholesale_role     = RolesHelper::is_wholesale_user( $customer_id );
        $setting            = SettingsHelper::get_settings();
        $is_disabled_tax    = $setting['general']['disable_tax'] ?? false;
        $is_disabled_coupon = $setting['general']['disable_coupon'] ?? false;
        $items              = [];

        if ( ! isset( $wholesale_role ) ) {
            return;
        }

        $is_discounted = PricingHelper::check_is_discounted( $order, $wholesale_role );

        // Force tax exempted (default is the value of 'is_vat_exempt' in meta_data of order)
        $is_force_tax_exempt = apply_filters( 'woocommerce_order_is_vat_exempt', 'yes' === $order->get_meta( 'is_vat_exempt' ), $order );

        $this->calculate_price_and_tax_of_items(
            $order,
            $is_discounted,
            $is_disabled_coupon,
            $wholesale_role,
            $is_disabled_tax,
            $is_force_tax_exempt,
            $items
        );

        // update "Items" displaying and calculate taxes in shipping items
        $this->calculate_tax_of_shippings( $order, $items, $is_discounted, $is_disabled_tax, $is_force_tax_exempt );

        // calculate taxes in fee items
        $this->calculate_tax_of_fees( $order, $is_discounted, $is_disabled_tax, $is_force_tax_exempt );

        // Update taxes
        $order->update_taxes();

        // Update meta data for filter
        if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
            PricingHelper::handle_order( $order, $wholesale_role, $is_discounted );
        }

        add_filter( 'woocommerce_order_is_vat_exempt', [ $this, 'ywhs_tax_enabled_handler' ], 999, 2 );
        add_filter( 'woocommerce_calc_tax', [ Tax::get_instance(), 'ywhs_maybe_disable_tax_calc' ], 9999 );
        Compatibles::get_instance()->add_price_related_hooks();
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
     * @param bool      $is_disabled_tax the disabled tax setting.
     * @param bool      $is_force_tax_exempt the tax exemption flag.
     * @param array     $items the items array to statistic items in order.
     */
    protected function calculate_price_and_tax_of_items(
        \WC_Order $order,
        bool $is_discounted,
        bool $is_disabled_coupon,
        array $wholesale_role,
        bool $is_disabled_tax,
        bool $is_force_tax_exempt,
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

            $quantity        = $item->get_quantity();
            $product         = $item->get_product();
            $is_removing_tax = false;
            if ( is_admin() ) {
                $extra = $extra_price_map[ $item->get_id() ] ?? 0;

                $new_price = $product->get_price( 'edit' ) + $extra;

                if ( $is_discounted ) {
                    $new_price = PricingHelper::calc_discounted_price( $new_price, $wholesale_role, $product, $extra );
                }

                $item->set_subtotal( $new_price * $quantity );
                $item->set_total( $new_price * $quantity - $discounted_coupon );
            }

            $items[] = $item->get_name() . ' x ' . $quantity;

            if ( ( $is_discounted && $is_disabled_tax ) ||
            ( $is_force_tax_exempt ) ) {
                $item->set_taxes(
                    [
                        'total'    => [],
                        'subtotal' => [],
                    ]
                );
                $is_removing_tax = true;
            } else {
                $tax_rates = WC_Tax::get_rates( $item->get_tax_class() );
                $taxes     = WC_Tax::calc_tax( $item->get_subtotal(), $tax_rates, false );
                $item->set_taxes(
                    [
                        'total'    => $taxes,
                        'subtotal' => $taxes,
                    ]
                );
            }//end if
        }//end foreach
        if ( $is_removing_tax ) {
            $order->remove_order_items( 'tax' );
        }
    }

    /**
     * Calculate the tax of order shipping items
     *
     * @param \WC_Order $order the order object.
     * @param array     $items the items array to statistic items in order.
     * @param bool      $is_discounted the status of order that meet the discount requirement.
     * @param bool      $is_disabled_tax the disabled tax setting.
     * @param bool      $is_force_tax_exempt the tax exemption flag.
     */
    protected function calculate_tax_of_shippings(
        \WC_Order $order,
        array $items,
        bool $is_discounted,
        bool $is_disabled_tax,
        bool $is_force_tax_exempt
    ) {
        foreach ( $order->get_items( 'shipping' ) as $shipping ) {
            $shipping->update_meta_data( 'Items', implode( ', ', $items ) );

            if ( ! $shipping instanceof \WC_Order_Item_Shipping ) {
                continue;
            }

            if ( ( $is_discounted && $is_disabled_tax ) ||
            ( $is_force_tax_exempt ) ) {
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
    }

    /**
     * Calculate the tax of order fee items
     *
     * @param \WC_Order $order the order object.
     * @param bool      $is_discounted the status of order that meet the discount requirement.
     * @param bool      $is_disabled_tax the disabled tax setting.
     * @param bool      $is_force_tax_exempt the tax exemption flag.
     */
    protected function calculate_tax_of_fees(
        \WC_Order $order,
        bool $is_discounted,
        bool $is_disabled_tax,
        bool $is_force_tax_exempt
    ) {
        foreach ( $order->get_items( 'fee' ) as $fee ) {
            if ( ! $fee instanceof \WC_Order_Item_Fee ) {
                continue;
            }

            if ( ( $is_discounted && $is_disabled_tax ) ||
            ( $is_force_tax_exempt ) ) {
                $fee->set_taxes( [] );
            } else {
                $tax_rates = WC_Tax::get_rates( $fee->get_tax_class() );
                $taxes     = WC_Tax::calc_tax( $fee->get_total(), $tax_rates, false );
                $fee->set_taxes(
                    [
                        'total'    => $taxes,
                        'subtotal' => $taxes,
                    ]
                );
            }//end if
        }//end foreach
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
     * @param array $result The WC default result.
     * @param array $args The arguments.
     */
    public function ywhs_admin_wc_orders_wholesale_filtered( $result, $args ) {
        $order_type = filter_input( INPUT_GET, '_ywhs_order_type', FILTER_SANITIZE_SPECIAL_CHARS );

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
