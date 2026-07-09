<?php

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\CategoryAccessHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-category-based-discount-nonce' );
$term_id                 = $term->term_id;
$category_based_discount = get_term_meta( $term_id, 'yaywholesaleb2b_category_based_discount', true );
$category_based_access   = CategoryAccessHelper::get_category_based_access_restriction( $term_id );
?>
<tr class="form-field">
    <th scope="row" valign="top"></th>
    <td>
        <div class="form-field ywhs_category_based_wholesale_rules_wrapper">
            <div class="ywhs_wholesale_rules">
                <div class="ywhs_header">
                    <!-- YayWholesale logo -->
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.2671 4.78611L12.4685 0.283433C12.1794 0.11646 11.823 0.11646 11.534 0.283433L3.73531 4.78611C3.11232 5.14531 3.11232 6.04473 3.73531 6.40393L11.534 10.9066C11.823 11.0736 12.1794 11.0736 12.4685 10.9066L20.2671 6.40393C20.8901 6.04473 20.8901 5.14531 20.2671 4.78611Z" fill="#FFC900" />
                        <path d="M1.0737 9.39947V18.4048C1.0737 18.7388 1.2519 19.0475 1.54095 19.213L9.3396 23.7157C9.96259 24.0749 10.7399 23.6259 10.7399 22.9075V13.9022C10.7399 13.5682 10.5617 13.2595 10.2727 13.0939L2.47403 8.59127C1.85104 8.23206 1.0737 8.68107 1.0737 9.39947Z" fill="#FFC900" />
                        <path d="M14.6658 23.7169L22.463 19.2142C22.7521 19.0472 22.9303 18.7385 22.9303 18.406V9.40201C22.9303 8.68361 22.1515 8.2332 21.5299 8.5938L13.7327 13.0965C13.4436 13.2635 13.2654 13.5721 13.2654 13.9047V22.9086C13.2654 23.6271 14.0442 24.0775 14.6658 23.7169Z" fill="#FFC900" />
                    </svg>

                    <div class="ywhs_separator"></div>
                    <p>Yay Wholesale B2B</p>
                </div>

                <div class="ywhs_body">
                    <p><?php esc_html_e( 'Wholesale Rules', 'yay-wholesale-b2b' ); ?></p>

                    <div class="ywhs_field">
                        <p><?php esc_html_e( 'Discount Rule', 'yay-wholesale-b2b' ); ?></p>
                        <div class="ywhs_field_inputs_wrapper">
                            <div class="wc-radios ywhs_radios">
                                <label>
                                    <input class='ywhs_discount_rule_default' name="yay-wholesale-b2b[discount-rule]" value="default" type="radio" class="select short"
                                        <?php echo ( esc_attr( ! isset( $category_based_discount['discount_rule'] ) || $category_based_discount['discount_rule'] === 'default' ? 'checked' : '' ) ); ?>>
                                    <?php esc_html_e( 'Default', 'yay-wholesale-b2b' ); ?>
                                </label>
                            </div>
                            <div class="wc-radios ywhs_radios">
                                <label>
                                    <input class='ywhs_discount_rule_custom' name="yay-wholesale-b2b[discount-rule]" value="custom" type="radio" class="select short"
                                        <?php echo ( esc_attr( isset( $category_based_discount['discount_rule'] ) && $category_based_discount['discount_rule'] === 'custom' ? 'checked' : '' ) ); ?>>
                                    <?php esc_html_e( 'Custom', 'yay-wholesale-b2b' ); ?>
                                </label>
                            </div>
                        </div>
                        <p class="ywhs_helptip"><?php esc_html_e( '"Default", use the role\'s default discount rate. ', 'yay-wholesale-b2b' ); ?></p>
                    </div>

                    <div class="ywhs_field ywhs_discount_values">
                        <p><?php esc_html_e( 'Discount Rate', 'yay-wholesale-b2b' ); ?></p>
                        <div class="ywhs_discount_roles_value">
                            <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                                <div class="ywhs_discount_role_value_item">
                                    <div class="ywhs_discount_role">
                                        <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                                    </div>
                                    <div class="ywhs_value_input ywhs_discount_rate_value">
                                        <input
                                            type="number"
                                            id="ywhs_category_based_rate_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                            name="yay-wholesale-b2b[discount-rates][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                            placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                            value=<?php echo ( esc_html( ! empty( $category_based_discount['discount_rates'] ) ? $category_based_discount['discount_rates'][ $wholesale_role['slug'] ] : '' ) ); ?>
                                            value=""
                                            step="0.01"
                                            min="0"
                                            max="100">
                                        </input>
                                        <span class="ywhs_input_suffix">%</span>
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
                            <input
                                class="ywhs_access_rule_all"
                                name="yay-wholesale-b2b[access-rule]"
                                value="visible-all"
                                type="radio"
                                <?php echo ( esc_attr( $category_based_access['rule'] === 'visible-all' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Visible to all', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input
                                class="ywhs_access_rule_specific"
                                name="yay-wholesale-b2b[access-rule]"
                                value="visible-specific-roles"
                                type="radio"
                                <?php echo ( esc_attr( $category_based_access['rule'] === 'visible-specific-roles' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Visible to specific roles', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                </div>
                <p class="ywhs_helptip"><?php esc_html_e( '"Visible to All", allow all users to view/purchase this product.', 'yay-wholesale-b2b' ); ?></p>
            </div>

            <div class="ywhs_access_enable_by_role">
                <div class="ywhs_field">
                    <p><?php esc_html_e( 'Retailer', 'yay-wholesale-b2b' ); ?></p>
                    <div class="ywhs_field_inputs_wrapper">
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    name="yay-wholesale-b2b[access-retailers]"
                                    value="disabled"
                                    type="radio"
                                    <?php echo ( esc_attr( $category_based_access['retailers'] === 'disabled' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    name="yay-wholesale-b2b[access-retailers]"
                                    value="enabled"
                                    type="radio"
                                    <?php echo ( esc_attr( $category_based_access['retailers'] === 'enabled' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Enabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="ywhs_field">
                    <p><?php esc_html_e( 'Wholesaler', 'yay-wholesale-b2b' ); ?></p>
                    <div class="ywhs_field_inputs_wrapper">
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    class="ywhs_access_wholesalers_disabled"
                                    name="yay-wholesale-b2b[access-wholesalers]"
                                    value="disabled"
                                    type="radio"
                                    <?php echo ( esc_attr( $category_based_access['wholesalers'] === 'disabled' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    class="ywhs_access_wholesalers_enabled"
                                    name="yay-wholesale-b2b[access-wholesalers]"
                                    value="enabled"
                                    type="radio"
                                    <?php echo ( esc_attr( $category_based_access['wholesalers'] === 'enabled' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Enabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    class="ywhs_access_wholesalers_enabled_selected"
                                    name="yay-wholesale-b2b[access-wholesalers]"
                                    value="enabled-selected-roles"
                                    type="radio"
                                    <?php echo ( esc_attr( $category_based_access['wholesalers'] === 'enabled-selected-roles' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Enabled for selected roles', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="ywhs_field ywhs_access_selected_roles">
                    <p><?php esc_html_e( 'Enable Role', 'yay-wholesale-b2b' ); ?></p>
                    <div class="ywhs_field_inputs_list">
                        <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                            <div class="wc-radios">
                                <label>
                                    <input
                                        name="yay-wholesale-b2b[access-selected-roles][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                        type="checkbox"
                                        <?php echo ( esc_attr( 'enabled' === $category_based_access['wholesalers'] || in_array( $wholesale_role['slug'], $category_based_access['selected_roles'], true ) ? 'checked' : '' ) ); ?> />
                                    <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                                </label>
                            </div>
                        <?php endforeach ?>
                    </div>
                </div>
            </div>
                </div>
            </div>
            <input type="hidden" name="ywhs-category-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
        </div>
    </td>
</tr>
