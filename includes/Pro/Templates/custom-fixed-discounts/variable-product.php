<?php

use YayWholesaleB2B\Helpers\RolesHelper;
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-product-based-discount-nonce' );
$product_based_discounts = get_post_meta( $variation->ID, 'yaywholesaleb2b_product_based_discount', true );
?>
<div class="form-field ywhs_variable_product_based_wholesale_rules_wrapper">
    <div class="ywhs_wholesale_rules">
        <div class="ywhs_header">
            <!-- YayWholesale logo -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.2671 4.78611L12.4685 0.283433C12.1794 0.11646 11.823 0.11646 11.534 0.283433L3.73531 4.78611C3.11232 5.14531 3.11232 6.04473 3.73531 6.40393L11.534 10.9066C11.823 11.0736 12.1794 11.0736 12.4685 10.9066L20.2671 6.40393C20.8901 6.04473 20.8901 5.14531 20.2671 4.78611Z" fill="#FFC900" />
                <path d="M1.0737 9.39947V18.4048C1.0737 18.7388 1.2519 19.0475 1.54095 19.213L9.3396 23.7157C9.96259 24.0749 10.7399 23.6259 10.7399 22.9075V13.9022C10.7399 13.5682 10.5617 13.2595 10.2727 13.0939L2.47403 8.59127C1.85104 8.23206 1.0737 8.68107 1.0737 9.39947Z" fill="#FFC900" />
                <path d="M14.6658 23.7169L22.463 19.2142C22.7521 19.0472 22.9303 18.7385 22.9303 18.406V9.40201C22.9303 8.68361 22.1515 8.2332 21.5299 8.5938L13.7327 13.0965C13.4436 13.2635 13.2654 13.5721 13.2654 13.9047V22.9086C13.2654 23.6271 14.0442 24.0775 14.6658 23.7169Z" fill="#FFC900" />
            </svg>

            <div class="ywhs_separator"></div>
            <p>Yay Wholesale B2B</span>
        </div>

        <div class="ywhs_body">
            <p><?php esc_html_e( 'Wholesale Rules', 'yay-wholesale-b2b' ); ?></p>

            <div class="ywhs_field">
                <p><?php esc_html_e( 'Discount Rule', 'yay-wholesale-b2b' ); ?></p>
                <div class="ywhs_field_inputs_wrapper">
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input class='ywhs_cat_discount_rule_default' name="yay-wholesale-b2b[discount-rule-<?php echo ( esc_html( $index ) ); ?>]" value="default" type="radio"
                                <?php echo ( esc_attr( ! isset( $product_based_discounts['discount_rule'] ) || $product_based_discounts['discount_rule'] === 'default' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Default', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input class='ywhs_cat_discount_rule_custom' name="yay-wholesale-b2b[discount-rule-<?php echo ( esc_html( $index ) ); ?>]" value="custom" type="radio"
                                <?php echo ( esc_attr( isset( $product_based_discounts['discount_rule'] ) && $product_based_discounts['discount_rule'] === 'custom' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Custom', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                </div>
                <p class="ywhs_helptip"><?php esc_html_e( '"Default", use the role\'s default discount rate. ', 'yay-wholesale-b2b' ); ?></p>
            </div>

            <div class="ywhs_field ywhs_discount_values">
                <input type="hidden" name="yay-wholesale-b2b[discount-type-<?php echo ( esc_html( $index ) ); ?>]" class="ywhs_discount_type" value="<?php echo ( esc_attr( isset( $product_based_discounts['discount_type'] ) ? $product_based_discounts['discount_type'] : 'fixed' ) ); ?>" />
                <div class="ywhs_discount_value_header">
                    <p><?php esc_html_e( 'Discount Value', 'yay-wholesale-b2b' ); ?></p>
                    <label>
                        <p><?php esc_html_e( 'Percentage', 'yay-wholesale-b2b' ); ?></p>
                        <div class="ywhs_switch">
                            <input type="checkbox"
                            class="ywhs_discount_type_switch"
                            <?php echo ( esc_attr( isset( $product_based_discounts['discount_type'] ) && $product_based_discounts['discount_type'] === 'fixed' ? 'checked' : '' ) ); ?> />
                            <span></span>
                        </div>
                        <p><?php esc_html_e( 'Fixed amount', 'yay-wholesale-b2b' ); ?></p>
                    </label>
                </div>
                <div class="ywhs_discount_roles_value">
                    <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                        <div class="ywhs_discount_role_value_item">
                            <div class="ywhs_discount_role">
                                <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                            </div>
                            <div class="ywhs_value_input ywhs_discount_rate_value">
                                <input
                                    type="number"
                                    id="ywhs_product_based_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    name="yay-wholesale-b2b[discount-rates-<?php echo ( esc_html( $index ) ); ?>][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                    placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                    value=<?php echo ( esc_html( $product_based_discounts['discount_rates'][ $wholesale_role['slug'] ] ?? '' ) ); ?>
                                    step="0.01"
                                    min="0"
                                    max="100">
                                </input>
                                <span class="ywhs_input_suffix">%</span>
                            </div>
                            <div class="ywhs_value_input ywhs_discount_fixed_value">
                                <input
                                    type="number"
                                    id="ywhs_product_based_fixed_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                    name="yay-wholesale-b2b[discount-fixed-<?php echo ( esc_html( $index ) ); ?>][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                    placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                    value=<?php echo ( esc_html( $product_based_discounts['discount_fixed'][ $wholesale_role['slug'] ] ?? '' ) ); ?>
                                    step="0.01"
                                    min="0" />
                                <span class="ywhs_input_suffix">
                                    <?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach ?>
                </div>
            </div>

            <div class="ywhs_field">
                <p><?php esc_html_e( 'Access Rule', 'yay-wholesale-b2b' ); ?></p>
                <div class="ywhs_field_inputs_wrapper">
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input name="yay-wholesale-b2b[access-rule-<?php echo ( esc_html( $index ) ); ?>]" value="all" type="radio" checked>
                            <?php esc_html_e( 'Viasible to all', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input name="yay-wholesale-b2b[access-rule-<?php echo ( esc_html( $index ) ); ?>]" value="specific-roles" type="radio">
                            <?php esc_html_e( 'Visible to specific roles', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                </div>
                <p class="ywhs_helptip"><?php esc_html_e( '"Visible to All", allow all users to view/purchase this product.', 'yay-wholesale-b2b' ); ?></p>
            </div>

            <div class="ywhs_field">
                <div class="ywhs_field_inputs_wrapper">
                    <div class="ywhs_select">
                        <label for="ywhs_access_rule_retailer"><?php esc_html_e( 'Retailer', 'yay-wholesale-b2b' ); ?></label>
                        <select id="ywhs_access_rule_retailer" name="yay-wholesale-b2b[access-rule-<?php echo ( esc_html( $index ) ); ?>][retailer]" class="ywhs_select">
                            <option value="disabled"><?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?></option>
                            <option value="enabled" selected="selected"><?php esc_html_e( 'Enabled', 'yay-wholesale-b2b' ); ?></option>
                        </select>
                    </div>
                    <div class="ywhs_select">
                        <label for="ywhs_access_rule_wholesaler"><?php esc_html_e( 'Wholesaler', 'yay-wholesale-b2b' ); ?></label>
                        <select id="ywhs_access_rule_wholesaler" name="yay-wholesale-b2b[access-rule-<?php echo ( esc_html( $index ) ); ?>][wholesaler]" class="ywhs_select">
                            <option value="disabled"><?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?></option>
                            <option value="enabled" selected="selected"><?php esc_html_e( 'Enabled', 'yay-wholesale-b2b' ); ?></option>
                            <option value="enabled-selected-roles"><?php esc_html_e( 'Enabled for Selected Roles', 'yay-wholesale-b2b' ); ?></option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="ywhs_field">
                <p><?php esc_html_e( 'Enable Role', 'yay-wholesale-b2b' ); ?></p>
                <div class="ywhs_field_inputs_grid">
                    <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input name="yay-wholesale-b2b[access-role-<?php echo ( esc_html( $index ) ); ?>]" value="<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>" type="checkbox" checked>
                                <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                            </label>
                        </div>
                    <?php endforeach ?>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" name="ywhs-product-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
</div>
