<?php

use YayWholesaleB2B\Helpers\RequestsHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** @var \WP_User $user */
$user_id = $user->ID;

$approved_request_id = get_user_meta( $user_id, RequestsHelper::USER_META_REQUEST, true );
if ( empty( $approved_request_id ) ) {
    $approved_request_id = RequestsHelper::get_the_last_approved_request_id_of_user( $user_id );
    if ( empty( $approved_request_id ) ) {
        return;
    }
    update_user_meta( $user_id, RequestsHelper::USER_META_REQUEST, $approved_request_id );
}

$request_data     = get_post_meta( $approved_request_id, RequestsHelper::REQUEST_META_DATA, true );
$approved_at_date = get_the_modified_date( '', $approved_request_id );
$approved_at_time = get_the_modified_time( '', $approved_request_id );

if ( ! is_array( $request_data ) ) {
    $request_data = [];
}

$merged_fields = RequestsHelper::get_merged_user_fields( $request_data );
?>
<!-- <h2><?php esc_html_e( 'Wholesaler Information', 'yay-wholesale-b2b' ); ?></h2> -->
<div class="ywhs_category_based_wholesale_rules_wrapper ywhs_wholesaler_user_wrapper">
    <div class="ywhs_wholesale_rules">
        <div class="ywhs_header">
            <!-- YayWholesale logo -->
            <img src="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/logo/yaywholesale_icon.svg' ) ); ?>" width="24" height="24"/>

            <div class="ywhs_separator" ></div>
            <p>Yay Wholesale B2B</span>
        </div>
        <div class="ywhs_body">
        <table class="form-table" id="ywhs_wholesaler_user_table">
            <tbody>
            <tr>
                <th><?php esc_html_e( 'Approved at', 'yay-wholesale-b2b' ); ?></th>
                <td><?php echo esc_attr( $approved_at_date . ' ' . $approved_at_time ); ?></td>
            </tr>
            <?php foreach ( $merged_fields as $field ) : ?>
                <?php
                $field_label = $field['label'] ?? '';
                $field_type  = $field['type'] ?? 'text';

                if ( empty( $field_label ) ) {
                    continue;
                }
                ?>
                <tr>
                    <th><label for="<?php echo esc_attr( $field['id'] ?? ( $field['key'] ?? '' ) ); ?>"><?php echo esc_html( $field_label ); ?></label></th>
                    <td>
                        <?php require YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/user/edit-user-field-input.php'; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        </div>
    </div>
</div>
