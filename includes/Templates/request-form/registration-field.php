<?php

defined( 'ABSPATH' ) || exit;

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;

?>
<div class="ywhs_registration_form_field <?php echo esc_attr( $column_class ); ?>">
    <?php RegistrationFieldsHelper::render_field_label( $field ); ?>
    <?php RegistrationFieldsHelper::render_field_input( $field, $is_autofill, $autofill ); ?>
</div>
