<?php

use YayWholesaleB2B\Helpers\RolesHelper;

$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-product-based-discount-nonce' );
$product_id              = get_the_ID();
$product_based_discounts = get_post_meta( $product_id, 'yaywholesaleb2b_product_based_discount', true );
?>
<div class="ywhs_product_based_discount_custom_container">
    <div class="ywhs_product_based_discount_title">
        <h3><?php esc_attr_e( 'Fixed discount for each wholesale role', 'yay-wholesale-b2b' ); ?></h3>
    </div>
    <div class="ywhs_product_based_discount_input_container">
        <i class="ywhs_product_based_discount_subtitle"><?php esc_html_e( 'You can manually set custom discount (fixed price / percentage) for each role.', 'yay-wholesale-b2b' ); ?></i>
        <?php
        foreach ( $wholesale_roles as $wholesale_role ) :
            ?>
            <div class="ywhs_product_based_discount_role">
                <div class="ywhs_product_based_discount_role_header">
                    <span>
                        <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                    </span>
                    <label class="ywhs_product_based_discount_mode">
                        <input type="checkbox"
                            id="ywhs_discount_mode_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                            name="ywhs_discount_mode_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                            value="custom"
                            data-wholesale-role=<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>
                            <?php checked( $product_based_discounts[ $wholesale_role['slug'] ]['discount_mode'], 'custom' ); ?> />
                        <?php esc_html_e( 'Custom product-based discount for this role.', 'yay-wholesale-b2b' ); ?>
                    </label>
                </div>
                <div class="ywhs_product_based_discount_inputs">
                    <div class="ywhs_product_based_discount_rule">
                        <div class="ywhs_product_based_discount_input_title">
                            <?php esc_html_e( 'Discount with:', 'yay-wholesale-b2b' ); ?>
                        </div>

                        <div class="ywhs_product_based_discount_input_values">
                            <label class="ywhs_product_based_rule_fixed">
                                <input type="radio"
                                    id="ywhs_discount_rule_fixed_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    name="ywhs_discount_rule_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    value="fixed"
                                    <?php checked( $product_based_discounts[ $wholesale_role['slug'] ]['discount_rule'], 'fixed' ); ?> />
                                <?php esc_html_e( 'Fixed price', 'yay-wholesale-b2b' ); ?>
                            </label>

                            <label class="ywhs_product_based_rule_rate">
                                <input type="radio"
                                    id="ywhs_discount_rule_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    name="ywhs_discount_rule_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    value="rate"
                                    <?php checked( $product_based_discounts[ $wholesale_role['slug'] ]['discount_rule'], 'rate' ); ?> />
                                <?php esc_html_e( 'Percentage', 'yay-wholesale-b2b' ); ?>
                            </label>

                        </div>
                    </div>
                    <div class="ywhs_product_based_discount_value_inputs">

                        <div class="ywhs_product_based_discount_fixed">
                            <?php
                            woocommerce_wp_text_input(
                                [
                                    'id'                => "ywhs_fixed_price_{$wholesale_role['slug']}",
                                    'type'              => 'number',
                                    'custom_attributes' => [
                                        'step' => 'any',
                                        'min'  => '0',
                                    ],
                                    // translators: %s: currency symbol
                                    'label'             => sprintf( esc_html__( 'Wholesale price (%s)', 'yay-wholesale-b2b' ), get_woocommerce_currency_symbol() ),
                                    'desc_tip'          => 'true',
                                    'value'             => $product_based_discounts[ $wholesale_role['slug'] ]['discount_fixed'] ?? 0,
                                ]
                            );
                            ?>
                        </div>

                        <div class="ywhs_product_based_discount_rate">
                            <?php
                            woocommerce_wp_text_input(
                                [
                                    'id'                => "ywhs_rate_price_{$wholesale_role['slug']}",
                                    'type'              => 'number',
                                    'custom_attributes' => [
                                        'step' => 'any',
                                        'min'  => '0',
                                        'max'  => '100',
                                    ],
                                    'label'             => __( 'Discount rate (%)', 'yay-wholesale-b2b' ),
                                    'desc_tip'          => 'true',
                                    'value'             => $product_based_discounts[ $wholesale_role['slug'] ]['discount_rate'] ?? 0,
                                ]
                            );
                            ?>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach ?>
    </div>
    <input type="hidden" name="ywhs-product-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
</div>
