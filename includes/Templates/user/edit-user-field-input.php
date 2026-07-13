<?php

use YayWholesaleB2B\Helpers\RequestsHelper;

defined( 'ABSPATH' ) || exit;

$field_type  = $field['type'] ?? 'text';
$field_key   = $field['key'] ?? ( $field['inputName'] ?? '' );
$field_value = $field['value'] ?? '';
$choices     = $field['choices'] ?? [];
$field_id    = $field['id'] ?? $field_key;

if ( 'attachment' === $field_type ) :
    if ( ! empty( $field_value ) ) :
        ?>
        <a
            href="<?php echo esc_url( $field_value ); ?>"
            class="button"
            target="_blank"
            rel="noopener noreferrer"
        ><?php esc_html_e( 'Download file', 'yay-wholesale-b2b' ); ?></a>
        <?php
    endif;
elseif ( 'textarea' === $field_type ) :
    ?>
    <textarea
        name="<?php echo esc_attr( $field_key ); ?>"
        id="<?php echo esc_attr( $field_id ); ?>"
        rows="5"
        cols="30"
        class="large-text"
    ><?php echo esc_textarea( is_scalar( $field_value ) ? (string) $field_value : '' ); ?></textarea>
    <?php
elseif ( 'select' === $field_type ) :
    $selected_value = is_scalar( $field_value ) ? (string) $field_value : '';
    ?>
    <select name="<?php echo esc_attr( $field_key ); ?>" id="<?php echo esc_attr( $field_id ); ?>" class="regular-text">
        <option value=""><?php esc_html_e( 'Select an option', 'yay-wholesale-b2b' ); ?></option>
        <?php foreach ( $choices as $choice ) : ?>
            <option value="<?php echo esc_attr( $choice ); ?>" <?php selected( $selected_value, $choice ); ?>>
                <?php echo esc_html( $choice ); ?>
            </option>
        <?php endforeach; ?>
    </select>
    <?php
elseif ( 'radio' === $field_type ) :
    $selected_value = is_scalar( $field_value ) ? (string) $field_value : '';
    ?>
    <fieldset>
        <?php foreach ( $choices as $choice_index => $choice ) : ?>
            <?php $choice_id = $field_id . '-' . $choice_index; ?>
            <label for="<?php echo esc_attr( $choice_id ); ?>" style="display:block;margin-bottom:4px;">
                <input
                    type="radio"
                    id="<?php echo esc_attr( $choice_id ); ?>"
                    name="<?php echo esc_attr( $field_key ); ?>"
                    value="<?php echo esc_attr( $choice ); ?>"
                    <?php checked( $selected_value, $choice ); ?>
                />
                <?php echo esc_html( $choice ); ?>
            </label>
        <?php endforeach; ?>
    </fieldset>
    <?php
elseif ( 'checkbox' === $field_type ) :
    $selected_values = RequestsHelper::normalize_choice_field_values( $field_value );
    ?>
    <fieldset>
        <?php foreach ( $choices as $choice_index => $choice ) : ?>
            <?php $choice_id = $field_id . '-' . $choice_index; ?>
            <label for="<?php echo esc_attr( $choice_id ); ?>" style="display:block;margin-bottom:4px;">
                <input
                    type="checkbox"
                    id="<?php echo esc_attr( $choice_id ); ?>"
                    name="<?php echo esc_attr( $field_key ); ?>[]"
                    value="<?php echo esc_attr( $choice ); ?>"
                    <?php checked( in_array( $choice, $selected_values, true ) ); ?>
                />
                <?php echo esc_html( $choice ); ?>
            </label>
        <?php endforeach; ?>
    </fieldset>
    <?php
else :
    $input_type = 'phone' === $field_type ? 'tel' : $field_type;
    $value      = is_scalar( $field_value ) ? (string) $field_value : '';

    if ( 'date' === $field_type && ! empty( $value ) ) {
        $timestamp = strtotime( $value );
        if ( false !== $timestamp ) {
            $value = gmdate( 'Y-m-d', $timestamp );
        }
    }
    ?>
    <input
        type="<?php echo esc_attr( $input_type ); ?>"
        class="regular-text"
        id="<?php echo esc_attr( $field_id ); ?>"
        name="<?php echo esc_attr( $field_key ); ?>"
        value="<?php echo esc_attr( $value ); ?>"
    />
    <?php
endif;
