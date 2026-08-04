<?php

defined( 'ABSPATH' ) || exit;

$field_type    = $field['type'] ?? 'text';
$field_id      = $field['id'] ?? '';
$input_name    = $field['inputName'] ?? '';
$placeholder   = $field['placeholder'] ?? '';
$is_required   = ! empty( $field['isRequired'] );
$choices       = $field['choices'] ?? [];
$required_attr = $is_required ? 'required' : '';

if ( 'textarea' === $field_type ) :
    ?>
    <textarea
        class="ywhs_registration_form_textarea"
        id="<?php echo esc_attr( $field_id ); ?>"
        placeholder="<?php echo esc_attr( $placeholder ); ?>"
        name="<?php echo esc_attr( $input_name ); ?>"
        <?php echo esc_attr( $required_attr ); ?>
    ></textarea>
    <?php
elseif ( 'select' === $field_type ) :
    $select_placeholder = $placeholder ? $placeholder : __( 'Select an option', 'yay-wholesale-b2b' );
    ?>
    <select
        class="ywhs_registration_form_select"
        id="<?php echo esc_attr( $field_id ); ?>"
        name="<?php echo esc_attr( $input_name ); ?>"
        <?php echo esc_attr( $required_attr ); ?>
    >
        <option value="" disabled selected hidden><?php echo esc_html( $select_placeholder ); ?></option>
        <?php foreach ( $choices as $choice ) : ?>
            <option value="<?php echo esc_attr( $choice ); ?>"><?php echo esc_html( $choice ); ?></option>
        <?php endforeach; ?>
    </select>
    <?php
elseif ( 'radio' === $field_type ) :
    ?>
    <div class="ywhs_registration_form_radios" role="radiogroup">
        <?php
        foreach ( $choices as $choice_index => $choice ) :
            $choice_id = $field_id . '-' . $choice;
            ?>
            <div class="ywhs_registration_form_choice">
                <input
                    class="ywhs_registration_form_radio"
                    type="radio"
                    id="<?php echo esc_attr( $choice_id ); ?>"
                    name="<?php echo esc_attr( $input_name ); ?>"
                    value="<?php echo esc_attr( $choice ); ?>"
                    <?php echo 0 === $choice_index ? esc_attr( $required_attr ) : ''; ?>
                />
                <label class="ywhs_registration_form_choice_label" for="<?php echo esc_attr( $choice_id ); ?>">
                    <?php echo esc_html( $choice ); ?>
                </label>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
elseif ( 'checkbox' === $field_type ) :
    ?>
    <div class="ywhs_registration_form_checkboxes">
        <?php
        foreach ( $choices as $choice_index => $choice ) :
            $choice_id = $field_id . '-' . $choice;
            ?>
            <div class="ywhs_registration_form_choice">
                <input
                    class="ywhs_registration_form_checkbox"
                    type="checkbox"
                    id="<?php echo esc_attr( $choice_id ); ?>"
                    name="<?php echo esc_attr( $input_name ); ?>[]"
                    value="<?php echo esc_attr( $choice ); ?>"
                    <?php echo 0 === $choice_index ? esc_attr( $required_attr ) : ''; ?>
                />
                <label class="ywhs_registration_form_choice_label" for="<?php echo esc_attr( $choice_id ); ?>">
                    <?php echo esc_html( $choice ); ?>
                </label>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
elseif ( 'attachment' === $field_type ) :
    $allowed_extensions = $field['allowedExtensions'] ?? [];
    $max_file_size      = $field['maxFileSize'] ?? 1;
    $extensions_label   = implode( ', ', $allowed_extensions );
    $extensions_values  = implode( ',', array_map( fn( $item ) => '.' . $item, $allowed_extensions ) );
    ?>
    <div
        class="ywhs_registration_form_attachment"
        data-max-file-size="<?php echo esc_attr( $max_file_size ); ?>"
        data-allowed-extensions="<?php echo esc_attr( wp_json_encode( $allowed_extensions ) ); ?>"
    >
    <label htmlFor="<?php echo esc_attr( $field_id ); ?>" class="ywhs_registration_form_drop_zone">
        <div class="ywhs_registration_form_zone_placeholder">
            <svg width="16" height="16" fill="currentColor" aria-hidden="true">
                <use href="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/upload.svg' ) ); ?>">#plus_icon</use>
            </svg>
            <span>
                <?php
                printf(
                    /* translators: %s: the word "click" */
                    esc_html__( 'Drop file here, or %s to upload', 'yay-wholesale-b2b' ),
                    '<span>' . esc_html__( 'click', 'yay-wholesale-b2b' ) . '</span>'
                );
                ?>
            </span>
        </div>
        <div class="ywhs_registration_form_zone_file">
            <div>
                <span class="ywhs_registration_form_file_name"></span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="ywhs_registration_form_file_remove">
                    <use href="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/x.svg' ) ); ?>">#plus_icon</use>
                </svg>
            </div>
        </div>

        <input
            class="ywhs_registration_form_file_input"
            type="file"
            id="<?php echo esc_attr( $field_id ); ?>"
            name="<?php echo esc_attr( $input_name ); ?>"
            accept="<?php echo esc_attr( $extensions_values ); ?>"
            <?php echo esc_attr( $required_attr ); ?>
        />
    </label>
        <?php if ( ! empty( $extensions_label ) ) : ?>
            <p class="ywhs_registration_form_file_hint">
                <?php
                echo esc_html(
                    sprintf(
                        /* translators: %s: comma-separated list of allowed file extensions */
                        __( 'Allowed extensions: %s', 'yay-wholesale-b2b' ),
                        $extensions_label
                    )
                );
                ?>
            </p>
        <?php endif; ?>
        <span class="ywhs_registration_form_field_error" role="alert" hidden></span>
    </div>
    <?php
else :
    $input_type = 'phone' === $field_type ? 'tel' : $field_type;
    ?>
    <input
        class="ywhs_registration_form_input"
        id="<?php echo esc_attr( $field_id ); ?>"
        type="<?php echo esc_attr( $input_type ); ?>"
        placeholder="<?php echo esc_attr( $placeholder ); ?>"
        name="<?php echo esc_attr( $input_name ); ?>"
        <?php echo esc_attr( $required_attr ); ?>
        <?php echo 'email_address' === $input_name && $email_autofill ? 'readonly' : ''; ?>
        <?php if ( 'email_address' === $input_name ) : ?>
            value="<?php echo esc_attr( trim( $email_autofill ) ); ?>"
        <?php elseif ( 'first_name' === $input_name ) : ?>
            value="<?php echo esc_attr( trim( $first_name_autofill ) ); ?>"
        <?php elseif ( 'last_name' === $input_name ) : ?>
            value="<?php echo esc_attr( trim( $last_name_autofill ) ); ?>"
        <?php endif; ?>
    />
    <?php
endif;
