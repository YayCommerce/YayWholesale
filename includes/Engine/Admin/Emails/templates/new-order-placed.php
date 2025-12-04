<?php

use Automattic\WooCommerce\Utilities\FeaturesUtil;

defined( 'ABSPATH' ) || exit;

$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );

// HEADER
do_action( 'woocommerce_email_header', $email_heading, $email );

/**
 * MAIN CONTENT
 * This comes from "Email content" field in email settings
 */
if ( ! empty( $content ) ) {
    $email_output = $content;

    $shortcodes = [
        '{order_details}'    => 'woocommerce_email_order_details',
        '{order_meta}'       => 'woocommerce_email_order_meta',
        '{customer_details}' => 'woocommerce_email_customer_details',
    ];

    foreach ( $shortcodes as $shortcode => $hook ) {
        if ( strpos( $email_output, $shortcode ) !== false ) {

            ob_start();
            // Render WooCommerce sections (tables, customer details, etc.)
            do_action( $hook, $order, $sent_to_admin, $plain_text, $email );
            $html = ob_get_clean();

            // Replace shortcode inside main email content
            $email_output = str_replace( $shortcode, $html, $email_output );
        }
    }

    /**
     * REPLACE CUSTOM PLACEHOLDERS
     * Example: {customer_name}, {order_number}, {admin_name}, etc.
     */
    if ( ! empty( $placeholders ) ) {
        foreach ( $placeholders as $key => $value ) {
            $email_output = str_replace( '{' . $key . '}', $value, $email_output );
        }
    }

    /**
     * RENDER FINAL PROCESSED CONTENT
     */
    if ( ! empty( $email_output ) ) {

        echo $email_improvements_enabled
        ? '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="email-additional-content email-additional-content-aligned">'
        : '';

        echo wp_kses_post( wpautop( wptexturize( $email_output ) ) );

        echo $email_improvements_enabled ? '</td></tr></table>' : '';
    }
}//end if
/**
 * ADDITIONAL CONTENT
 */
if ( $additional_content ) {
    echo $email_improvements_enabled ? '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="email-additional-content">' : '';
    echo wp_kses_post( wpautop( wptexturize( $additional_content ) ) );
    echo $email_improvements_enabled ? '</td></tr></table>' : '';
}

// FOOTER
do_action( 'woocommerce_email_footer', $email );
