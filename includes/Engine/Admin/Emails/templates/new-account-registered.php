<?php

use Automattic\WooCommerce\Utilities\FeaturesUtil;

defined( 'ABSPATH' ) || exit;

$email_improvements_enabled = FeaturesUtil::feature_is_enabled( 'email_improvements' );

/**
 * Fires to output the email header.
 *
 * @hooked WC_Emails::email_header()
 *
 * @since 3.7.0
 */
do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<?php
/**
 * Show user-defined body content - this is set in each email's settings.
 * Available placeholders: {user_login}, {user_email}, {site_title}, {set_password_url}
 * translators: %s: list of placeholders
 * translators: %s: list of placeholders
 */
if ( $content ) {
    echo $email_improvements_enabled ? '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="email-additional-content email-additional-content-aligned">' : '';
    echo wp_kses_post( wpautop( wptexturize( $content ) ) );
    echo $email_improvements_enabled ? '</td></tr></table>' : '';
}
?>
<?php
/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( $additional_content ) {
    echo $email_improvements_enabled ? '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="email-additional-content email-additional-content-aligned">' : '';
    echo wp_kses_post( wpautop( wptexturize( $additional_content ) ) );
    echo $email_improvements_enabled ? '</td></tr></table>' : '';
}

/**
 * Fires to output the email footer.
 *
 * @hooked WC_Emails::email_footer()
 *
 * @since 3.7.0
 */
do_action( 'woocommerce_email_footer', $email );