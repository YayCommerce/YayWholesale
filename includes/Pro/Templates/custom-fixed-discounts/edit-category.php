<?php

use YayWholesaleB2B\Helpers\RolesHelper;
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$wholesale_roles        = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce = wp_create_nonce( 'ywhs-category-based-discount-nonce' );
$term_id                = $term->term_id;
$term_meta              = get_term_meta( $term_id, 'yaywholesaleb2b_category_based_discount', true );
?>
<tr class="form-field ywhs_category_based_discount_rule_wrapper">
    <th scope="row" valign="top">
        <label for="ywhs_category_based_discount_rule">
            <?php esc_html_e( 'Discount Rule', 'yay-wholesale-b2b' ); ?>
            <?php echo wc_help_tip( __( '"Default" - use the role\'s default discount rate. "Custom" - use the discount rate defined below.', 'yay-wholesale-b2b' ) ); ?>
        </label>
    </th>
    <td>
        <?php
        woocommerce_wp_select(
            [
                'id'      => 'ywhs_category_based_discount_rule',
                'name'    => 'yay-wholesale-b2b[discount-rule]',
                'value'   => $term_meta['discount_rule'] ?? 'default',
                'label'   => '',
                'options' => [
                    'default' => __( 'Default', 'yay-wholesale-b2b' ),
                    'custom'  => __( 'Custom', 'yay-wholesale-b2b' ),
                ],
            ]
        );
        ?>
    </td>
</tr>
<tr class="form-field ywhs_category_based_discount_rates">
    <th scope="row" valign="top">
        <label>
            <?php esc_html_e( 'Discount Rates', 'yay-wholesale-b2b' ); ?>
            <?php echo wc_help_tip( __( 'Enter a percentage discount which will be deducted from the standard price of all products in this category. You can override this for individual products.', 'yay-wholesale-b2b' ) ); ?>
        </label>
    </th>
    <td>
        <table class="ywhs_category_based_discount_rate_table">
            <tbody>
                <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                    <tr class="ywhs_category_based_discount_rate_row">
                        <td class="ywhs_category_based_discount_rate_role">
                            <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                        </td>
                        <td class="ywhs_category_based_discount_rate">
                            <input
                                type="number"
                                id="ywhs_category_based_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                name="yay-wholesale-b2b[discount-rates][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                value=<?php echo ( esc_html( ! empty( $term_meta['discount_rates'] ) ? $term_meta['discount_rates'][ $wholesale_role['slug'] ] : '' ) ); ?>
                                step="0.01"
                                min="0"
                                max="100" />
                            %
                        </td>
                    </tr>
                <?php endforeach ?>
            </tbody>
        </table>
    </td>
</tr>
<input type="hidden" name="ywhs-category-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
