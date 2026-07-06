<?php

use YayWholesaleB2B\Helpers\RequestsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$approved_request_id = get_user_meta( $user->ID, RequestsHelper::USER_META_REQUEST, true );
if ( empty( $approved_request_id ) ) {
    $approved_request_id = RequestsHelper::get_the_last_approved_request_id_of_user( $user->ID );
    if ( empty( $approved_request_id ) ) {
        return;
    }
    update_user_meta( $user->ID, RequestsHelper::USER_META_REQUEST, $approved_request_id );
}

$data                = get_post_meta( $approved_request_id, RequestsHelper::REQUEST_META_DATA, true );
$approved_at_date    = get_the_modified_date( '', $approved_request_id );
$approved_at_time    = get_the_modified_time( '', $approved_request_id );
$excluded_fields_key = [ 'first_name', 'last_name', 'message', 'email_address' ];
$editable_types      = [ 'text', 'email', 'phone', 'number', 'date', 'textarea' ];
$readonly_types      = [ 'radio', 'select', 'checkbox' ];

if ( ! is_array( $data ) ) {
    $data = [];
}
?>
<h2><?php esc_html_e( 'Wholesaler Information', 'yay-wholesale-b2b' ); ?></h2>
<table class="form-table" id="ywhs_wholesaler_user_table">
    <tbody>
    <tr>
        <th><?php esc_html_e( 'Approved at', 'yay-wholesale-b2b' ); ?></th>
        <td><input type="text" class="regular-text" readonly value="<?php echo esc_attr( $approved_at_date . ' ' . $approved_at_time ); ?>"/></td>
    </tr>
    <?php foreach ( $data as $label => $input ) : ?>
        <?php
        if ( ! is_array( $input ) || empty( $input['key'] ) || in_array( $input['key'], $excluded_fields_key, true ) ) {
            continue;
        }

        $field_type  = $input['type'] ?? 'text';
        $field_key   = $input['key'];
        $field_value = $input['value'] ?? '';

        if ( is_array( $field_value ) ) {
            $field_value = implode( ', ', $field_value );
        }
        ?>
        <tr>
            <th><?php echo esc_html( $label ); ?></th>
            <td>
                <?php if ( 'textarea' === $field_type ) : ?>
                    <textarea
                        name="<?php echo esc_attr( $field_key ); ?>"
                        rows="5"
                        cols="30"
                        class="large-text"
                    ><?php echo esc_textarea( $field_value ); ?></textarea>
                <?php elseif ( in_array( $field_type, $editable_types, true ) && 'textarea' !== $field_type ) : ?>
                    <?php
                    $input_type = 'phone' === $field_type ? 'tel' : $field_type;
                    if ( 'date' === $field_type && ! empty( $field_value ) ) {
                        $timestamp = strtotime( $field_value );
                        if ( false !== $timestamp ) {
                            $field_value = gmdate( 'Y-m-d', $timestamp );
                        }
                    }
                    ?>
                    <input
                        type="<?php echo esc_attr( $input_type ); ?>"
                        class="regular-text"
                        name="<?php echo esc_attr( $field_key ); ?>"
                        value="<?php echo esc_attr( $field_value ); ?>"
                    />
                <?php elseif ( in_array( $field_type, $readonly_types, true ) ) : ?>
                    <?php if ( 'checkbox' === $field_type ) : ?>
                        <textarea rows="3" cols="30" class="large-text" readonly><?php echo esc_textarea( $field_value ); ?></textarea>
                    <?php else : ?>
                        <input type="text" class="regular-text" readonly value="<?php echo esc_attr( $field_value ); ?>"/>
                    <?php endif; ?>
                <?php elseif ( 'attachment' === $field_type ) : ?>
                    <?php if ( ! empty( $field_value ) ) : ?>
                        <a
                            href="<?php echo esc_url( $field_value ); ?>"
                            class="button"
                            target="_blank"
                            rel="noopener noreferrer"
                        ><?php esc_html_e( 'Download file', 'yay-wholesale-b2b' ); ?></a>
                    <?php endif; ?>
                <?php else : ?>
                    <input type="text" class="regular-text" readonly value="<?php echo esc_attr( $field_value ); ?>"/>
                <?php endif; ?>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>
