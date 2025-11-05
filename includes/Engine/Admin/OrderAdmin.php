<?php
namespace Yay_Wholesale\Engine\Admin;

use Yay_Wholesale\Utils\SingletonTrait;


defined( 'ABSPATH' ) || exit;

/**
 * Order Admin Engine
 */
class OrderAdmin {
    use SingletonTrait;

    protected function __construct() {
        // Add wholesale column to the orders list table.
        add_filter( 'manage_edit-shop_order_columns', [ $this, 'add_wholesale_column_in_orders_list_table' ], 20 );
        add_filter( 'manage_woocommerce_page_wc-orders_columns', [ $this, 'add_wholesale_column_in_orders_list_table' ], 20 );

        // Display data in the column.
        add_action( 'manage_shop_order_posts_custom_column', [ $this, 'display_wholesale_column_in_orders_list_table' ], 20, 2 );
        add_action( 'manage_woocommerce_page_wc-orders_custom_column', [ $this, 'display_wholesale_column_in_orders_list_table' ], 20, 2 );

        // Add filter dropdown
        add_action( 'restrict_manage_posts', [ $this, 'add_wholesale_filter_dropdown' ], 20, 2 );
        add_action( 'woocommerce_order_list_table_restrict_manage_orders', [ $this, 'add_wholesale_filter_dropdown' ], 20, 2 );

        // Handle filter query by wholesale type.
        add_filter( 'request', [ $this, 'filter_orders_by_wholesale_type' ] );
        add_filter( 'woocommerce_order_list_table_prepare_items_query_args', [ $this, 'filter_orders_by_wholesale_type' ] );
    }

    /**
     * Add wholesale column to the orders list table.
     *
     * @param array $columns The columns array.
     * @return array The columns array.
     */
    public function add_wholesale_column_in_orders_list_table( array $columns ): array {
        $new_columns = [];

        foreach ( $columns as $key => $label ) {
            $new_columns[ $key ] = $label;
            // Add after the "order_status" column.
            if ( 'order_status' === $key ) {
                $new_columns['wholesale'] = __( 'Wholesale', 'yay-wholesale' );
            }
        }

        return $new_columns;
    }

    /**
     * Display data in the column.
     *
     * @param string $column The column name.
     * @param int    $post_id The post ID.
     */
    public function display_wholesale_column_in_orders_list_table( $column, $post_id ): void {
        if ( 'wholesale' !== $column || empty( $post_id ) || ! $post_id ) {
            return;
        }

        $order = wc_get_order( $post_id );
        if ( ! $order ) {
            return;
        }

        $wholesale = $order->get_meta( 'yay_wholesale' );
        if ( 'yes' === $wholesale ) {
            echo '<span class="yay-wholesale-badge yay-wholesale-user">' . esc_html__( 'Wholesale', 'yay-wholesale' ) . '</span>';
        } else {
            echo '<span class="yay-wholesale-badge yay-retail-user">' . esc_html__( 'Retail', 'yay-wholesale' ) . '</span>';
        }
    }

    /**
     * Add dropdown filter above Orders table (Wholesale / Retail).
     *
     * @param string $post_type The post type.
     * @param string $which The which.
     */
    public function add_wholesale_filter_dropdown( $post_type, $which ) {
        if ( 'shop_order' !== $post_type ) {
            return;
        }

        $selected = isset( $_GET['wholesale_type'] ) ? sanitize_text_field( wp_unslash( $_GET['wholesale_type'] ) ) : '';

        $options = [
            ''          => esc_html__( 'Wholesale and Retail', 'yay-wholesale' ),
            'wholesale' => esc_html__( 'Wholesale', 'yay-wholesale' ),
            'retail'    => esc_html__( 'Retail', 'yay-wholesale' ),
        ];
        ?>
        <select name="wholesale_type">
            <?php foreach ( $options as $value => $label ) : ?>
                <option value="<?php echo esc_attr( $value ); ?>" <?php selected( $selected, $value ); ?>>
                    <?php echo esc_html( $label ); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    /*
     * Filter orders list by selected dropdown.
     *
     * @param array $query_args The query arguments.
     * @return array The query arguments.
     */
    public function filter_orders_by_wholesale_type( $query_args ) {
        global $typenow;
        if ( ! isset( $query_args['type'] ) || 'shop_order' !== $query_args['type'] ) {
            return $query_args;
        }
        if ( in_array( $typenow, wc_get_order_types( 'order-meta-boxes' ), true ) ) {
            return $query_args;
        }
        $type = isset( $_REQUEST['wholesale_type'] ) && ! empty( $_REQUEST['wholesale_type'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['wholesale_type'] ) ) : false;
        if ( $type ) {
            if ( 'wholesale' === $type ) {
                $query_args['meta_query'][] = [
                    'key'     => 'yay_wholesale',
                    'value'   => 'yes',
                    'compare' => '=',
                ];
            } else {
                $query_args['meta_query'][] = [
                    'relation' => 'OR',
                    [
                        'key'     => 'yay_wholesale',
                        'compare' => 'NOT EXISTS',
                    ],
                    [
                        'key'     => 'yay_wholesale',
                        'value'   => 'no',
                        'compare' => '=',
                    ],
                ];
            }
        }//end if

        return $query_args;
    }
}
