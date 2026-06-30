<?php

defined( 'ABSPATH' ) || exit;

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;

?>

<div class="ywhs_request_form_error">
    <div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="red"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle-alert-icon lucide-circle-alert"
        >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>

        <div class="ywhs_form_error_content">
            <div>
                <strong>
                    <?php echo esc_html__( 'Unable to send your request', 'yay-wholesale-b2b' ); ?>
                </strong>
            </div>

            <span class="ywhs_form_error_msg"></span>
        </div>
    </div>
</div>

<form id="ywhs_request_form">
    <?php RegistrationFieldsHelper::render_form_fields(); ?>
</form>

<h3 id="ywhs_success_notice">
    <?php echo ! empty( $successful_registration_message ) ? esc_html( $successful_registration_message ) : esc_html( __( 'Thank you for registering. Your account begin reviewing. Please wait to be approved.', 'yay-wholesale-b2b' ) ); ?>
</h3>