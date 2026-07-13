<?php

use YayWholesaleB2B\Helpers\RolesHelper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$wholesale_roles        = RolesHelper::get_wholesale_roles();
$custom_discounts_nonce = wp_create_nonce( 'ywhs-category-based-discount-nonce' );
?>
<div class="form-field ywhs_category_based_wholesale_rules_wrapper">
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
                            <input class='ywhs_discount_rule_default' name="yay-wholesale-b2b[discount-rule]" value="default" type="radio" class="select short" checked>
                            <?php esc_html_e( 'Default', 'yay-wholesale-b2b' ); ?>
                        </label>
                    </div>
                    <div class="wc-radios ywhs_radios">
                        <label>
                            <input class='ywhs_discount_rule_custom' name="yay-wholesale-b2b[discount-rule]" value="custom" type="radio" class="select short">
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
                                checked>
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
                            >
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
                                >
                                <?php esc_html_e( 'Disabled', 'yay-wholesale-b2b' ); ?>
                            </label>
                        </div>
                        <div class="wc-radios ywhs_radios">
                            <label>
                                <input
                                    name="yay-wholesale-b2b[access-retailers]"
                                    value="enabled"
                                    type="radio"
                                    checked>
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
                                    >
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
                                    checked>
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
                                    >
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
                                        checked/>
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
