<?php

use YayWholesaleB2B\Helpers\RolesHelper;

$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-product-based-discount-nonce' );
$product_based_discounts = get_post_meta( $variation->ID, 'yaywholesaleb2b_product_based_discount', true );
?>
<?php do_action( 'ywhs_before_render_variable_product_based_discount', $wholesale_roles, $variation->ID, $index ); ?>
<div class="ywhs_variable_product_based_discount_custom_container">
    <div class="ywhs_product_based_discount_title">
        <?php esc_attr_e( 'Product-based discount for each wholesale role', 'yay-wholesale-b2b' ); ?>
    </div>
    <div class="ywhs_product_based_discount_input_container">
        <i class="ywhs_product_based_discount_subtitle"><?php esc_html_e( 'You can manually set custom discount (fixed price / percentage) for each role.', 'yay-wholesale-b2b' ); ?></i>

        <!-- Discount Rule -->
        <?php
        woocommerce_wp_select(
            [
                'id'            => "yay-wholesale-b2b[discount-rule-$index]",
                'value'         => $product_based_discounts['discount_rule'] ?? 'default',
                'label'         => __( 'Discount rule', 'yay-wholesale-b2b' ),
                'options'       => [
                    'default' => __( 'Default', 'yay-wholesale-b2b' ),
                    'custom'  => __( 'Custom', 'yay-wholesale-b2b' ),
                ],
                'desc_tip'      => 'true',
                'description'   => __( '"Default" - use the role\'s default discount rate. "Custom" - use the discount rate defined below.', 'yay-wholesale-b2b' ),
                'wrapper_class' => 'form-row form-row-full ywhs-product-based-discount-rule',
            ]
        );
        ?>

        <div class="ywhs_product_based_discount_inputs">
            <!-- Discount Rule -->
            <div class="ywhs_product_based_discount_type">
                <div class="ywhs_product_based_discount_type_title">
                    <?php esc_html_e( 'Discount with', 'yay-wholesale-b2b' ); ?>
                </div>

                <div class="ywhs_product_based_discount_type_radios">
                    <label class="ywhs_product_based_rule_fixed">
                        <input type="radio"
                            id="ywhs_discount_type_fixed"
                            name="yay-wholesale-b2b[discount-type-<?php echo ( esc_html( $index ) ); ?>]"
                            value="fixed"
                            <?php checked( $product_based_discounts['discount_type'] ?? 'fixed', 'fixed' ); ?> />
                        <?php esc_html_e( 'Fixed price', 'yay-wholesale-b2b' ); ?>
                    </label>

                    <label class="ywhs_product_based_rule_rate">
                        <input type="radio"
                            id="ywhs_discount_type_rate"
                            name="yay-wholesale-b2b[discount-type-<?php echo ( esc_html( $index ) ); ?>]"
                            value="rate"
                            <?php checked( $product_based_discounts['discount_type'] ?? 'fixed', 'rate' ); ?> />
                        <?php esc_html_e( 'Percentage', 'yay-wholesale-b2b' ); ?>
                    </label>

                </div>
            </div>

            <!-- Role Discount Values -->
            <div class="ywhs_product_based_discount_roles">
                <div class="ywhs_product_based_discount_roles_title">
                    <?php esc_html_e( 'Discount value', 'yay-wholesale-b2b' ); ?>
                </div>
                <table class="ywhs_product_based_discount_rate_table">
                    <thead>
                        <tr>
                            <th><?php esc_html_e( 'Role', 'yay-wholesale-b2b' ); ?></th>
                            <th class="ywhs_product_based_discount_rate"><?php esc_html_e( 'Rate (%)', 'yay-wholesale-b2b' ); ?></th>
                            <th class="ywhs_product_based_discount_fixed">
                                <?php
                                // translators: %s: currency symbol
                                echo ( sprintf( esc_html__( 'Fixed (%s)', 'yay-wholesale-b2b' ), esc_html( get_woocommerce_currency_symbol() ) ) );
                                ?>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                            <tr class="ywhs_product_based_discount_rate_row">
                                <td class="ywhs_product_based_discount_rate_role">
                                    <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                                </td>
                                <td class="ywhs_product_based_discount_rate">
                                    <input
                                        type="number"
                                        id="ywhs_product_based_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                        name="yay-wholesale-b2b[discount-rates-<?php echo ( esc_html( $index ) ); ?>][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                        placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                        value=<?php echo ( esc_html( $product_based_discounts['discount_rate'][ $wholesale_role['slug'] ] ?? '' ) ); ?>
                                        step="0.01"
                                        min="0"
                                        max="100" />
                                    %
                                </td>
                                <td class="ywhs_product_based_discount_fixed">
                                    <input
                                        type="number"
                                        id="ywhs_product_based_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                        name="yay-wholesale-b2b[discount-fixed-<?php echo ( esc_html( $index ) ); ?>][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                        placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                        value=<?php echo ( esc_html( $product_based_discounts['discount_fixed'][ $wholesale_role['slug'] ] ?? '' ) ); ?>
                                        step="0.01"
                                        min="0" />
                                    <?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>
                                </td>
                            </tr>
                        <?php endforeach ?>
                    </tbody>
                </table>
            </div>
            <input type="hidden" name="ywhs-product-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
        </div>
    </div>
</div>
<?php do_action( 'ywhs_after_render_variable_product_based_discount', $wholesale_roles, $variation->ID, $index ); ?>
