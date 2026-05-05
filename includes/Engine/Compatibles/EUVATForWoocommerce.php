<?php
namespace YayWholesaleB2B\Engine\Compatibles;

use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * EUVATForWoocommerce Compatible
 */
class EUVATForWoocommerce {
    use SingletonTrait;

    protected function __construct() {
        if ( ! defined( 'ALG_WC_EU_VAT_VERSION' ) || ! defined( 'ALG_WC_EU_VAT_FILE' ) ) {
            return;
        }

        if ( 'yes' === get_option( 'alg_wc_eu_vat_admin_new_order_email', 'no' ) ) {
            add_action(
                'woocommerce_email_customer_details',
                [ $this, 'add_eu_vat_data_to_new_wholesale_order_email' ],
                100,
                4
            );
        }
    }

    public function add_eu_vat_data_to_new_wholesale_order_email( $order, $sent_to_admin, $plain_text, $email ) {
        if (
            ! $sent_to_admin ||
            'yaywholesaleb2b_new_order_placed' !== $email->id
        ) {
            return;
        }

        $table_data = $this->output_meta_box_data( $order, true );

        if ( $plain_text ) {
            echo "\n" . esc_html( wc_strtoupper( esc_html__( 'EU VAT', 'yay-wholesale-b2b' ) ) ) . "\n\n";
            foreach ( $table_data as $row ) {
                echo wp_kses_post( $row[0] ?? '' ) . ': ' . wp_kses_post( $row[1] ?? '' ) . "\n";
            }
        } elseif ( function_exists( 'alg_wc_eu_vat_get_table_html' ) ) {
            ?>
            <div style="font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif; margin-bottom: 40px;">
                <h2><?php esc_html_e( 'EU VAT', 'yay-wholesale-b2b' ); ?></h2>
                <?php
                echo \alg_wc_eu_vat_get_table_html(
                    $table_data,
                    [
                        'table_heading_type' => 'vertical',
                        'table_style'        => 'border-collapse: collapse;',
                        'row_styles'         => 'border: 1px solid #e5e5e5;',
                    ]
                );
                ?>
            </div>
                    <?php

        }//end if
    }

    protected function output_meta_box_data( $object, $do_return_table_data = false ) {

        $_order = is_a( $object, 'WP_Post' ) ? wc_get_order( $object->ID ) : $object;

        $_customer_ip_address = ( \alg_wc_eu_vat()->core->is_wc_version_below_3_0_0 ? $_order->customer_ip_address : $_order->get_customer_ip_address() );

        // Country by IP
        $customer_country = \alg_wc_eu_vat_get_customers_location_by_ip( $_customer_ip_address );

        // Customer EU VAT number
        if ( '' == ( $customer_eu_vat_number = $_order->get_meta( '_' . \alg_wc_eu_vat_get_field_id() ) ) ) {
            $customer_eu_vat_number = '-';
        }

        // Taxes
        $taxes       = '';
        $taxes_array = $_order->get_tax_totals();
        if ( empty( $taxes_array ) ) {
            $taxes = '-';
        } else {
            foreach ( $taxes_array as $tax ) {
                $taxes .= $tax->label . ': ' . $tax->formatted_amount . '<br>';
            }
        }

        // Results table
        $table_data = [
            [
                __( 'Customer IP', 'yay-wholesale-b2b' ),
                $_customer_ip_address,
            ],
            [
                __( 'Country by IP', 'yay-wholesale-b2b' ),
                \alg_wc_eu_vat_get_country_name_by_code( $customer_country ) . ' [' . $customer_country . ']',
            ],
            [
                __( 'Customer EU VAT Number', 'yay-wholesale-b2b' ),
                $customer_eu_vat_number,
            ],
            [
                __( 'Taxes', 'yay-wholesale-b2b' ),
                $taxes,
            ],
        ];

        // VAT Details
        $customer_eu_vat_details = $_order->get_meta( \alg_wc_eu_vat_get_field_id() . '_details' );
        if ( is_array( $customer_eu_vat_details ) ) {
            $table_data = array_merge(
                $table_data,
                [
                    [
                        __( 'Business Name', 'yay-wholesale-b2b' ),
                        esc_html( $customer_eu_vat_details['business_name']['data'] ?? '' ),
                    ],
                    [
                        __( 'Business Address', 'yay-wholesale-b2b' ),
                        esc_html( $customer_eu_vat_details['business_address']['data'] ?? '' ),
                    ],
                    [
                        __( 'Country Code', 'yay-wholesale-b2b' ),
                        esc_html( $customer_eu_vat_details['country_code']['data'] ?? '' ),
                    ],
                    [
                        __( 'VAT Number', 'yay-wholesale-b2b' ),
                        esc_html( $customer_eu_vat_details['vat_number']['data'] ?? '' ),
                    ],
                ]
            );
        }//end if

        // Request Identifier
        $request_identifier = $_order->get_meta(
            apply_filters(
                'alg_wc_eu_vat_request_identifier_meta_key',
                \alg_wc_eu_vat_get_field_id() . '_request_identifier'
            )
        );
        if ( '' !== $request_identifier ) {
            $table_data = array_merge(
                $table_data,
                [
                    [
                        __( 'Request Identifier', 'yay-wholesale-b2b' ),
                        esc_html( $request_identifier ),
                    ],
                ]
            );
        }

        // Return table data?
        if ( $do_return_table_data ) {
            return $table_data;
        }

        // Output
        echo \alg_wc_eu_vat_get_table_html(
            $table_data,
            [
                'table_class'        => 'widefat striped',
                'table_heading_type' => 'vertical',
            ]
        );

        // Order ID
        $order_id = $_order->get_id();

        // Validate VAT and remove taxes
        echo '<p>' .
            '<a href="' . esc_url( add_query_arg( 'validate_vat_and_maybe_remove_taxes', absint( $order_id ) ) ) . '">' .
                esc_html__( 'Validate VAT and remove taxes', 'yay-wholesale-b2b' ) .
            '</a>' .
        '</p>';

        // Fetch VAT details and display the business name and address
        echo '<p>' .
            '<a href="' . esc_url(
                add_query_arg(
                    [
                        'get_vat_details' => absint( $order_id ),
                        'country'         => esc_html( $_order->get_billing_country() ),
                        'number'          => esc_html( $customer_eu_vat_number ),
                    ]
                )
            ) . '">' .
                esc_html__( 'Get VAT details', 'yay-wholesale-b2b' ) .
            '</a>' .
        '</p>';
    }
}
