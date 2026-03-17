<?php

defined( 'ABSPATH' ) || exit;
add_action(
    'admin_notices',
    function () {
        if ( current_user_can( 'activate_plugins' ) ) {
            ?>
                <div class="notice notice-error is-dismissible">
                <p>
                    <strong><?php esc_html_e( 'It looks like you have another YayWholesale version installed, please delete it before activating this new version. All of the settings and data are still preserved.', 'yay-wholesale-b2b' ); ?>
                    <!-- <a href="https://docs.yaycommerce.com/yay-wholesale/getting-started/how-to-update-yay-wholesale-b2b"><?php esc_html_e( 'Read more details.', 'yay-wholesale-b2b' ); ?></a> -->
                    <a href="https://docs.yaycommerce.com/"><?php esc_html_e( 'Read more details.', 'yay-wholesale-b2b' ); ?></a>
                    </strong>
                </p>
                </div>
            <?php
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            if ( isset( $_GET['activate'] ) ) {
                unset( $_GET['activate'] );
            }
        }
    }
);
