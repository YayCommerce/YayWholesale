<?php

use YayWholesaleB2B\Helpers\RolesHelper;

$wholesale_roles        = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce = wp_create_nonce( 'ywhs-category-based-discount-nonce' );
?>
<div class="form-field ywhs_category_based_discount_rule_wrapper">
    <?php
    woocommerce_wp_select(
        [
            'id'      => 'ywhs_category_based_discount_rule',
            'name'    => 'yay-wholesale-b2b[discount-rule]',
            'value'   => '',

            'label'   => __(
                'Discount rule',
                'yay-wholesale-b2b'
            ) . wc_help_tip(
                __(
                    '"Default" - use the role\'s default discount rate. "Custom" - use the discount rate defined below.',
                    'yay-wholesale-b2b'
                )
            ),

            'options' => [
                ''       => __( 'Default', 'yay-wholesale-b2b' ),
                'custom' => __( 'Custom', 'yay-wholesale-b2b' ),
            ],
        ]
    );
    ?>
</div>
<div class="form-field ywhs_category_based_discount_rates">
    <label>
        <?php esc_html_e( 'Discount rates', 'yay-wholesale-b2b' ); ?>
        <?php echo wc_help_tip( esc_html__( 'Enter a percentage discount which will be deducted from the standard price of all products in this category. You can override this for individual products.', 'yay-wholesale-b2b' ) ); ?>
    </label>
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
                            value=""
                            step="0.01"
                            min="0"
                            max="100" />
                        %
                    </td>
                </tr>
            <?php endforeach ?>
        </tbody>
    </table>
    <input type="hidden" name="ywhs-category-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
</div>
