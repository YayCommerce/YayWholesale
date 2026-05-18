<?php

use YayWholesaleB2B\Helpers\RolesHelper;

$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-product-based-discount-nonce' );
$product_id              = get_the_ID();
$product_based_discounts = get_post_meta( $product_id, 'yaywholesaleb2b_product_based_discount', true );
?>
<?php do_action( 'ywhs_before_render_single_product_based_discount', $wholesale_roles, $product_id ); ?>
<div class="ywhs_product_based_discount_custom_container">
    <div class="ywhs_product_based_discount_title">
        <h3><?php esc_attr_e( 'Product-based discount for each wholesale role', 'yay-wholesale-b2b' ); ?></h3>
    </div>
    <div class="ywhs_product_based_discount_input_container">
        <i class="ywhs_product_based_discount_subtitle"><?php esc_html_e( 'You can manually set custom discount (fixed price / percentage) for each role.', 'yay-wholesale-b2b' ); ?></i>

        <!-- Discount Mode -->
        <div class="ywhs_product_based_discount_mode">
            <label>
                <input type="checkbox"
                    id="ywhs_discount_mode"
                    name="ywhs_discount_mode"
                    value="custom"
                    <?php checked( $product_based_discounts['discount_mode'] ?? 'default', 'custom' ); ?> />
                <?php esc_html_e( 'Custom product-based discount for this role.', 'yay-wholesale-b2b' ); ?>
            </label>
        </div>

        <div class="ywhs_product_based_discount_inputs">
            <!-- Discount Rule -->
            <div class="ywhs_product_based_discount_rule">
                <div class="ywhs_product_based_discount_rule_title">
                    <?php esc_html_e( 'Discount with:', 'yay-wholesale-b2b' ); ?>
                </div>

                <div class="ywhs_product_based_discount_rule_radios">
                    <label class="ywhs_product_based_rule_fixed">
                        <input type="radio"
                            id="ywhs_discount_rule_fixed"
                            name="ywhs_discount_rule"
                            value="fixed"
                            <?php checked( $product_based_discounts['discount_rule'] ?? 'fixed', 'fixed' ); ?> />
                        <?php esc_html_e( 'Fixed price', 'yay-wholesale-b2b' ); ?>
                    </label>

                    <label class="ywhs_product_based_rule_rate">
                        <input type="radio"
                            id="ywhs_discount_rule_rate"
                            name="ywhs_discount_rule"
                            value="rate"
                            <?php checked( $product_based_discounts['discount_rule'] ?? 'fixed', 'rate' ); ?> />
                        <?php esc_html_e( 'Percentage', 'yay-wholesale-b2b' ); ?>
                    </label>

                </div>
            </div>

            <!-- Role Discount Values -->
            <div class="ywhs_product_based_discount_roles">
                <?php
                foreach ( $wholesale_roles as $wholesale_role ) :
                    ?>
                    <div class="ywhs_product_based_discount_role">
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
                                    'placeholder'       => __( 'Auto', 'yay-wholesale-b2b' ),
                                    // translators: %s: Role's name, %s: currency symbol
                                    'label'             => sprintf( esc_html__( '%1$s (%2$s)', 'yay-wholesale-b2b' ), esc_html( $wholesale_role['name'] ), get_woocommerce_currency_symbol() ),
                                    'desc_tip'          => 'true',
                                    'value'             => $product_based_discounts['discount_fixed'][ $wholesale_role['slug'] ] ?? '',
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
                                    'placeholder'       => __( 'Auto', 'yay-wholesale-b2b' ),
                                    // translators: %s: Role's name
                                    'label'             => sprintf( esc_html__( '%1$s (%%)', 'yay-wholesale-b2b' ), esc_html( $wholesale_role['name'] ) ),
                                    'desc_tip'          => 'true',
                                    'value'             => $product_based_discounts['discount_rate'][ $wholesale_role['slug'] ] ?? '',
                                ]
                            );
                            ?>
                        </div>
                    </div>
                <?php endforeach ?>
            </div>
            <input type="hidden" name="ywhs-product-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
        </div>
    </div>
</div>
<?php do_action( 'ywhs_after_render_single_product_based_discount', $wholesale_roles, $product_id ); ?>
