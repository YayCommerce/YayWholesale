<?php

defined( 'ABSPATH' ) || exit;

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

?>

<div class="ywhs_request_form_error">
    <div>
    <img src="<?php echo( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/circle-alert.svg' ) ); ?>" width="18" height="18" />
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

<?php
$settings              = SettingsHelper::get_settings();
$registration_fields   = $settings['registration_fields']['fields'] ?? [];
$has_attachment_fields = RegistrationFieldsHelper::has_attachment_fields( $registration_fields );
$form_enctype          = $has_attachment_fields ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
?>
<form id="ywhs_request_form" enctype="<?php echo esc_attr( $form_enctype ); ?>">
    <?php RegistrationFieldsHelper::render_form_fields(); ?>
</form>

<h3 id="ywhs_success_notice">
    <?php echo ! empty( $successful_registration_message ) ? esc_html( $successful_registration_message ) : esc_html( __( 'Thank you for registering. Your account begin reviewing. Please wait to be approved.', 'yay-wholesale-b2b' ) ); ?>
</h3>
