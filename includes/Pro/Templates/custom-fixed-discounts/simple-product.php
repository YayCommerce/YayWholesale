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
            <img src="<?php echo ( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/logo/yaywholesale_icon.svg' ) ); ?>" width="24" height="24"/>

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
                                <?php esc_html_e( 'Tiered Pricing', 'yay-wholesale-b2b' ); ?>
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
                                                placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
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
                                                                        placeholder="<?php esc_attr_e( 'Auto', 'yay-wholesale-b2b' ); ?>"
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
                                                                <svg width="11" height="12" fill="currentColor" aria-hidden="true" >
                                                                    <use href="<?php echo( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/delete.svg' ) ); ?>" >#delete_icon</use>
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
                                                data-role="<?php echo ( esc_html( $wholesale_role['slug'] ) ); ?>"
                                                data-delete-icon="<?php echo( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/delete.svg' ) ); ?>"
                                                >
                                                <svg width="8" height="8" fill="currentColor" aria-hidden="true" >
                                                    <use href="<?php echo( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/plus.svg' ) ); ?>" >#plus_icon</use>
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
