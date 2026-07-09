<?php

use YayWholesaleB2B\Helpers\RolesHelper;
use YayWholesaleB2B\Pro\Helpers\AccessHelpers\ProductAccessHelper;
use YayWholesaleB2B\Pro\Helpers\PricingHelpers\ProductPricingHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// global $product_object;
$wholesale_roles         = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce  = wp_create_nonce( 'ywhs-product-based-discount-nonce' );
$product_id              = get_the_ID();
$product                 = wc_get_product( $product_id );
$product_based_discounts = ProductPricingHelper::get_product_based_discount_setting( $product_id );
$product_based_access    = ProductAccessHelper::get_product_based_access_restriction( $product_id );
?>
<div class="form-field ywhs_product_based_wholesale_rules_wrapper">
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
                            <input class='ywhs_discount_rule_default' name="yay-wholesale-b2b[discount-rule]" value="default" type="radio"
                                <?php echo ( esc_attr( $product_based_discounts['discount_rule'] === 'default' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Default', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input class='ywhs_discount_rule_custom' name="yay-wholesale-b2b[discount-rule]" value="custom" type="radio"
                                <?php echo ( esc_attr( $product_based_discounts['discount_rule'] === 'custom' ? 'checked' : '' ) ); ?>>
                            <?php esc_html_e( 'Custom', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                </div>
                <p class="ywhs_helptip"><?php esc_html_e( '"Default", use the role\'s default discount rate. ', 'yay-wholesale-b2b' ); ?></p>
            </div>

            <div class="ywhs_discount_values">
                <div class="ywhs_field">
                    <p><?php esc_html_e( 'Discount Type', 'yay-wholesale-b2b' ); ?></p>
                    <div class="ywhs_field_inputs_wrapper">
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input class='ywhs_discount_type_fixed_and_percent' name="yay-wholesale-b2b[discount-type]" value="by_role" type="radio"
                                    <?php echo ( esc_attr( $product_based_discounts['discount_type'] === 'by_role' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Percentage / Fixed Amount', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input class='ywhs_discount_rule_tier' name="yay-wholesale-b2b[discount-type]" value="tiered" type="radio"
                                    <?php echo ( esc_attr( $product_based_discounts['discount_type'] === 'tiered' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Tiered pricing', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="ywhs_field ywhs_discount_table">
                    <div class="ywhs_discount_value_header">
                        <p><?php esc_html_e( 'Discount Value', 'yay-wholesale-b2b' ); ?></p>
                    </div>
                    <table class="ywhs_discount_roles_value">
                        <thead>
                            <tr>
                                <th><?php esc_html_e( 'Role', 'yay-wholesale-b2b' ); ?></th>
                                <th class="ywhs_tier_type"><?php esc_html_e( 'Base price', 'yay-wholesale-b2b' ); ?></th>
                                <th class="ywhs_tier_type"><?php esc_html_e( 'Volume Tiers', 'yay-wholesale-b2b' ); ?></th>
                                <th class="ywhs_fixed_rate_type"><?php esc_html_e( 'Discount', 'yay-wholesale-b2b' ); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ( $wholesale_roles as $wholesale_role ) : ?>
                                <tr>
                                    <td class="ywhs_discount_role_cell"><?php echo ( esc_html( $wholesale_role['name'] ) ); ?></td>
                                    <td class="ywhs_tier_base_price_cell ywhs_tier_type">
                                        <div class="ywhs_value_input">
                                            <input
                                                type="number"
                                                id="ywhs_product_tier_base_price_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                                name="yay-wholesale-b2b[base-tier-price][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                                value=<?php echo ( esc_html( $product_based_discounts['discount_tiered']['wholesaler'][ $wholesale_role['slug'] ]['base_tier']['price'] ?? $product->get_price( 'edit' ) ) ); ?>
                                                step="0.01"
                                                min="0"
                                                >
                                            <div class="ywhs_input_suffix">
                                                <?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>
                                            </div>
                                            </input>
                                        </div>
                                    </td>
                                    <td class="ywhs_volume_tier_cell ywhs_tier_type">
                                        <div class="ywhs_tier_cell">
                                            <div class="ywhs_tier_volume_container">
                                                <?php if ( array_key_exists( $wholesale_role['slug'], $product_based_discounts['discount_tiered']['wholesaler'] ) ) : ?>
                                                    <?php foreach ( $product_based_discounts['discount_tiered']['wholesaler'][ $wholesale_role['slug'] ]['tier_list'] as $index => $tier ) : ?>

                                                        <div class="ywhs_tier_volume">
                                                            <div class="ywhs_tier_from_quantity">
                                                                <span><?php esc_html_e( 'From', 'yay-wholesale-b2b' ); ?></span>
                                                                <input
                                                                    type="number"
                                                                    id="ywhs_product_tier_from_quantity_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                                                    name="yay-wholesale-b2b[tier-from-quantity][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>][<?php echo ( esc_html( $index ) ); ?>]"
                                                                    value=<?php echo ( esc_html( $tier['from'] ) ); ?>
                                                                    step="0.01"
                                                                    min="0">
                                                            </div>
                                                            <div class="ywhs_tier_price">
                                                                <span><?php esc_html_e( 'Price', 'yay-wholesale-b2b' ); ?></span>
                                                                <div class="ywhs_value_input">
                                                                    <input
                                                                        type="number"
                                                                        id="ywhs_product_tier_base_price_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                                                        name="yay-wholesale-b2b[tier-price][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>][<?php echo ( esc_html( $index ) ); ?>]"
                                                                        value=<?php echo ( esc_html( $tier['price'] ) ); ?>
                                                                        step="0.01"
                                                                        min="0">
                                                                    </input>
                                                                    <div class="ywhs_input_suffix">
                                                                        <?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>
                                                                    </div>
                                                                </div>
                                                                <div class="ywhs_tier_volume_delete">
                                                                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 1.12514C5.13433 1.12504 4.77761 1.23319 4.47901 1.43469C4.18041 1.6362 3.95461 1.92115 3.83271 2.25028H7.16729C7.04529 1.92121 6.81947 1.63632 6.52089 1.43483C6.22231 1.23334 5.86565 1.12514 5.5 1.12514ZM5.5 0C4.8208 8.81952e-06 4.16244 0.223974 3.63629 0.634014C3.11014 1.04405 2.74849 1.615 2.6125 2.25028H0V3.37542H0.997857L1.64057 10.124C1.6894 10.6367 1.93725 11.1134 2.33545 11.4605C2.73365 11.8076 3.25341 12.0001 3.79264 12H7.20814C7.74711 11.9999 8.26658 11.8075 8.66459 11.4605C9.06261 11.1136 9.31043 10.6372 9.35943 10.1248L10.0021 3.37542H11V2.25028H8.3875C8.25151 1.615 7.88986 1.04405 7.36371 0.634014C6.83756 0.223974 6.1792 8.81952e-06 5.5 0ZM8.81886 3.37542H2.18114L2.81443 10.022C2.83659 10.2551 2.94924 10.4718 3.13024 10.6296C3.31124 10.7874 3.54752 10.8749 3.79264 10.8749H7.20814C7.45327 10.8749 7.68954 10.7874 7.87055 10.6296C8.05155 10.4718 8.1642 10.2551 8.18636 10.022L8.81886 3.37542Z" fill="currentColor" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    <?php endforeach ?>
                                                <?php endif ?>
                                            </div>
                                            <div
                                                class="ywhs_add_tier_volume"
                                                data-currency="<?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>"
                                                data-role="<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>">
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <g clip-path="url(#clip0_10960_15952)">
                                                        <path d="M8 3.2H4.8V0H3.2V3.2H0V4.8H3.2V8H4.8V4.8H8V3.2Z" fill="currentColor" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_10960_15952">
                                                            <rect width="8" height="8" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>

                                                <?php esc_html_e( 'Add Tier', 'yay-wholesale-b2b' ); ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="ywhs_fixed_rate_type ywhs_tier_base_price_cell">
                                        <div class="ywhs_value_input">
                                            <input type="hidden" class="ywhs_discount_type" name="yay-wholesale-b2b[discount-by-role-types][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]" value=<?php echo ( esc_html( $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['type'] ) ); ?> />
                                            <input
                                                type="number"
                                                id="ywhs_product_based_value_<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                                class="ywhs_discount_value"
                                                name="yay-wholesale-b2b[discount-by-role-val][<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>]"
                                                placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
                                                value=<?php echo ( esc_html( 'fixed' === $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['type'] ? $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['fixed'] : $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['rate'] ) ); ?>
                                                data-rate="<?php echo ( esc_html( $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['rate'] ?? '' ) ); ?>"
                                                data-fixed="<?php echo ( esc_html( $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['fixed'] ?? '' ) ); ?>"
                                                step="0.01"
                                                min="0"
                                                <?php echo ( esc_html( 'rate' === $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['type'] ? 'max=100' : '' ) ); ?>
                                                >
                                            </input>
                                            <div class="ywhs_discount_type_trigger">
                                                <?php echo ( esc_html( 'fixed' === $product_based_discounts['discount_by_role']['wholesaler'][ $wholesale_role['slug'] ]['type'] ? get_woocommerce_currency_symbol() : '%' ) ); ?>
                                            </div>
                                            <div class="ywhs_discount_type_switcher">
                                                <div class="ywhs_discount_type_menu">
                                                    <div class="ywhs_discount_type_rate"><?php esc_attr_e( 'Percentage', 'yay-wholesale-b2b' ); ?></div>
                                                    <div class="ywhs_discount_type_fixed" data-currency-symbol="<?php echo ( esc_html( get_woocommerce_currency_symbol() ) ); ?>">
                                                        <?php esc_attr_e( 'Fixed Amount', 'yay-wholesale-b2b' ); ?>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach ?>
                        </tbody>
                    </table>
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
                                <?php echo ( esc_attr( $product_based_access['rule'] === 'visible-all' ? 'checked' : '' ) ); ?>>
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
                                <?php echo ( esc_attr( $product_based_access['rule'] === 'visible-specific-roles' ? 'checked' : '' ) ); ?>>
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
                                    <?php echo ( esc_attr( $product_based_access['retailers'] === 'disabled' ? 'checked' : '' ) ); ?>>
                                <?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    name="yay-wholesale-b2b[access-retailers]"
                                    value="enabled"
                                    type="radio"
                                    <?php echo ( esc_attr( $product_based_access['retailers'] === 'enabled' ? 'checked' : '' ) ); ?>>
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
                                    <?php echo ( esc_attr( $product_based_access['wholesalers'] === 'disabled' ? 'checked' : '' ) ); ?>>
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
                                    <?php echo ( esc_attr( $product_based_access['wholesalers'] === 'enabled' ? 'checked' : '' ) ); ?>>
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
                                    <?php echo ( esc_attr( $product_based_access['wholesalers'] === 'enabled-selected-roles' ? 'checked' : '' ) ); ?>>
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
                                        <?php echo ( esc_attr( 'enabled' === $product_based_access['wholesalers'] || in_array( $wholesale_role['slug'], $product_based_access['selected_roles'], true ) ? 'checked' : '' ) ); ?> />
                                    <?php echo ( esc_html( $wholesale_role['name'] ) ); ?>
                                </label>
                            </div>
                        <?php endforeach ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input type="hidden" name="ywhs-product-based-discount-nonce" value="<?php echo esc_attr( $custom_discounts_nonce ); ?>" />
</div>
