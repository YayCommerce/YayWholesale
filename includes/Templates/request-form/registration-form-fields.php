<?php

defined( 'ABSPATH' ) || exit;

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;
$is_autofill         = is_user_logged_in();
$first_name_autofill = '';
$last_name_autofill  = '';
$email_autofill      = '';

if ( $is_autofill ) {
    $user                = wp_get_current_user();
    $first_name_autofill = $user->first_name;
    $last_name_autofill  = $user->last_name;
    $email_autofill      = $user->user_email;
}
?>
<div class="ywhs_registration_form_card">
    <div class="ywhs_registration_form_body">
        <?php if ( empty( $visible_fields ) ) : ?>
            <p class="ywhs_registration_form_empty">
                <?php echo esc_html( __( 'No visible fields to preview', 'yay-wholesale-b2b' ) ); ?>
            </p>
        <?php else : ?>
            <div id="ywhs_form_fields_container" class="ywhs_registration_form_grid">
                <?php
                foreach ( $visible_fields as $field ) {
                    $column_class = RegistrationFieldsHelper::get_field_column_class( $field );

                    RegistrationFieldsHelper::render_field(
                        $field,
                        $is_autofill,
                        [
                            'first_name' => $first_name_autofill,
                            'last_name'  => $last_name_autofill,
                            'email'      => $email_autofill,
                        ],
                        $column_class
                    );
                }
                ?>
            </div>
        <?php endif; ?>

        <button type="submit" class="ywhs_registration_form_submit">
            <?php echo ! empty( $submit_label ) ? esc_html( $submit_label ) : esc_html( __( 'Register now', 'yay-wholesale-b2b' ) ); ?>
        </button>
    </div>
</div>
