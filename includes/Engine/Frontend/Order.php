<?php
namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Utils\SingletonTrait;
use Yay_Wholesale\Helpers\RolesHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Order Engine
 */
class Order {
    use SingletonTrait;

    protected function __construct() {
        // Add the wholesale order meta on new order.
        add_action( 'woocommerce_new_order', [ $this, 'handle_new_order' ], 10, 2 );
        // Add the wholesale order meta on update order.
        add_action( 'woocommerce_after_order_object_save', [ $this, 'handle_order_update' ], 10, 1 );
    }

    /*
     * Add the wholesale to order meta.
     *
     * @param \WC_Order $order The order object.
     */
    protected function add_wholesale_to_order_meta( \WC_Order $order ): void {
        if ( ! $order instanceof \WC_Order ) {
            return;
        }

        $user_id = $order->get_customer_id();

        if ( ! $user_id ) {
            return;
        }

        $role = RolesHelper::is_wholesale_user( $user_id );

        if ( $role ) {
            $order->update_meta_data( 'yay_wholesale', 'yes' );
        } else {
            $order->update_meta_data( 'yay_wholesale', 'no' );
        }
    }

    /*
     * Add the wholesale to order meta on new order.
     *
     * @param int $order_id The order ID.
     * @param \WC_Order $order The order object.
     */
    public function handle_new_order( int $order_id, \WC_Order $order ): void {
        $this->add_wholesale_to_order_meta( $order );
        $order->save();
    }

    /*
     * Add the wholesale to order meta on update order.
     *
     * @param \WC_Order $order The order object.
     * @param \WC_Data_Store $data_store The data store object.
     */
    public function handle_order_update( \WC_Order $order ): void {
        // Avoid loop: if Woo is in the process of creating a new order, skip.
        if ( doing_action( 'woocommerce_new_order' ) ) {
            return;
        }

        // If there are no changes -> skip.
        if ( empty( $order->get_changes() ) ) {
            return;
        }

        $this->add_wholesale_to_order_meta( $order );
    }
}
