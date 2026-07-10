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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.2671 4.78611L12.4685 0.283433C12.1794 0.11646 11.823 0.11646 11.534 0.283433L3.73531 4.78611C3.11232 5.14531 3.11232 6.04473 3.73531 6.40393L11.534 10.9066C11.823 11.0736 12.1794 11.0736 12.4685 10.9066L20.2671 6.40393C20.8901 6.04473 20.8901 5.14531 20.2671 4.78611Z" fill="#FFC900"/>
                <path d="M1.0737 9.39947V18.4048C1.0737 18.7388 1.2519 19.0475 1.54095 19.213L9.3396 23.7157C9.96259 24.0749 10.7399 23.6259 10.7399 22.9075V13.9022C10.7399 13.5682 10.5617 13.2595 10.2727 13.0939L2.47403 8.59127C1.85104 8.23206 1.0737 8.68107 1.0737 9.39947Z" fill="#FFC900"/>
                <path d="M14.6658 23.7169L22.463 19.2142C22.7521 19.0472 22.9303 18.7385 22.9303 18.406V9.40201C22.9303 8.68361 22.1515 8.2332 21.5299 8.5938L13.7327 13.0965C13.4436 13.2635 13.2654 13.5721 13.2654 13.9047V22.9086C13.2654 23.6271 14.0442 24.0775 14.6658 23.7169Z" fill="#FFC900"/>
            </svg>

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