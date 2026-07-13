<?php

defined( 'ABSPATH' ) || exit;

$label       = $field['label'] ?? '';
$is_required = ! empty( $field['isRequired'] );

?>
<label class="ywhs_registration_form_label">
    <?php echo esc_html( $label ); ?>
    <?php if ( $is_required ) : ?>
        <span class="ywhs_registration_form_required">*</span>
    <?php endif; ?>
</label>
