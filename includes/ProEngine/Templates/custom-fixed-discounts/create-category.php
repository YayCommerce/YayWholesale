<?php

use YayWholesaleB2B\Helpers\RolesHelper;

$wholesale_roles        = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce = wp_create_nonce( 'ywhs-category-based-discount-nonce' );
?>
<div class="form-field ywhs_category_based_discount_mode_wrapper">
    <?php
    woocommerce_wp_select(
        [
            'id'      => 'ywhs_category_based_discount_mode',
            'name'    => 'ywhs_category_based_discount_mode',
            'value'   => '',

            'label'   => __(
                'Wholesale discount mode',
                'yay-wholesale-b2b'
            ) . wc_help_tip(
                __(
                    '"Default" uses the wholesale role discount. "Custom" lets you set a category-specific discount.',
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
    <?php esc_html_e( 'Wholesale discount rates', 'yay-wholesale-b2b' ); ?>
    <?php echo wc_help_tip( esc_html__( 'Enter a percentage discount which will be deducted from the standard price of all products in this category. You can override this for individual products.', 'yay-wholesale-b2b' ) ); ?>
    </label>
    <table class="ywhs_category_based_discount_rate_table">
    <thead>
        <tr>
            <th><?php esc_html_e( 'Role', 'yay-wholesale-b2b' ); ?></th>
            <th><?php esc_html_e( 'Rate (%)', 'yay-wholesale-b2b' ); ?></th>
        </tr>
    </thead>
    <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
        <tr class="ywhs_category_based_discount_rate_row">
        <th class="ywhs_category_based_discount_rate_role">
            <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
        </th>
        <th class="ywhs_category_based_discount_rate">
            <input
                type="number"
                id="ywhs_category_based_rate_<?php echo( esc_html( $wholesale_role['slug'] ) ); ?>"
                name="ywhs_category_based_rate_<?php echo( esc_html( $wholesale_role['slug'] ) ); ?>"
                placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                value=""
                step="0.01"
                min="0"
                max="100"
                />
            %
        </th>
        </tr>
    <?php endforeach ?>
    </table>
    <input type="hidden" name="ywhs-category-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
</div>
