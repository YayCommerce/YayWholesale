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
?>
<h2><?php esc_html_e( 'Wholesaler Information', 'yay-wholesale-b2b' ); ?></h2>
<table class="form-table" id="ywhs_wholesaler_user_table">
    <tbody>
    <tr>
        <th><?php esc_html_e( 'Approved at', 'yay-wholesale-b2b' ); ?></th>
        <td><input type="text" class="regular-text" readonly value="<?php echo( esc_html( $approved_at_date . ' ' . $approved_at_time ) ); ?>"/></td>
    </tr>
    <?php foreach ( $data as $label => $input ) : ?>
        <?php if ( ! in_array( $input['key'], $excluded_fields_key, true ) ) : ?>
            <?php
            if ( $input['type'] === 'date' ) {
                $timestamp      = strtotime( $input['value'] );
                $input['value'] = date_i18n( get_option( 'date_format' ), $timestamp );
            }
            ?>
            <tr>
            <th><?php echo( esc_html( $label ) ); ?></th>
            <td >
                <?php if ( $input['type'] === 'textarea' ) : ?>
                    <textarea rows="5" cols="3" readonly ><?php echo( esc_html( $input['value'] ?? '' ) ); ?></textarea>
                <?php else : ?>
                    <input type="text" class="regular-text" readonly value="<?php echo( esc_html( $input['value'] ?? '' ) ); ?>"/>
                <?php endif ?>
            </td>
            </tr>
        <?php endif ?>
    <?php endforeach ?>
    </tbody>
</table>
