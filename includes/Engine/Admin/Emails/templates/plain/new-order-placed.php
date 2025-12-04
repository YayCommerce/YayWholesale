<?php

defined( 'ABSPATH' ) || exit;

$email_improvements_enabled = \Automattic\WooCommerce\Utilities\FeaturesUtil::feature_is_enabled( 'email_improvements' );

// HEADER (plain)
echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";


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
            do_action( $hook, $order, $sent_to_admin, true, $email );
            $section      = ob_get_clean();
            $section      = wp_strip_all_tags( $section );
            $email_output = str_replace( $shortcode, $section, $email_output );
        }
    }

    /**
     * Replace placeholders
     */
    if ( ! empty( $placeholders ) ) {
        foreach ( $placeholders as $key => $value ) {
            $email_output = str_replace( '{' . $key . '}', $value, $email_output );
        }
    }

    /**
     * Print final plain text content
     */
    if ( ! empty( $email_output ) ) {
        echo esc_html( wp_strip_all_tags( wptexturize( $email_output ) ) ) . "\n\n";
    }
}//end if

/**
 * ADDITIONAL CONTENT
 */
if ( $additional_content ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) ) . "\n\n";
}

// FOOTER
echo wp_kses_post(
    apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) )
);
