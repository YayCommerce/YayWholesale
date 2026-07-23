<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Controllers\BaseRestController;
use YayWholesaleB2B\Helpers\SettingsHelper;
use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * Get Localize value
 */
class LocalizeHelper {
    public const VAR_ADMIN = 'yayWholesaleB2BAdmin';
    public const VAR_META  = 'yayWholesaleB2BMeta';

    public static function get_admin_data() {
        $settings   = SettingsHelper::get_full_settings();
        $roles      = RolesHelper::get_wholesale_roles();
        $admin_data = [
            'settings'         => $settings,
            'wholesale_emails' => SettingsHelper::get_email_templates(),
            'roles'            => RolesHelper::handle_roles_data( $roles, $settings ),
            'setup_wizard'     => [
                'status'  => SetupWizardHelper::get_setup_wizard_status(),
                'helpful' => get_option( 'yaywholesaleb2b_setup_helpful', 'blank' ),
            ],
            'wc_page_ids'      => array_values(
                array_filter(
                    array_map(
                        'intval',
                        [
                            get_option( 'woocommerce_shop_page_id' ),
                            get_option( 'woocommerce_cart_page_id' ),
                            get_option( 'woocommerce_checkout_page_id' ),
                            get_option( 'woocommerce_myaccount_page_id' ),
                            get_option( 'woocommerce_terms_page_id' ),
                        ]
                    )
                )
            ),
        ];

        return apply_filters( 'ywhs_localize_admin_data', $admin_data );
    }

    public static function get_meta() {
        $meta = [
            'wpMeta'        => [
                'siteUrl'      => esc_url_raw( site_url() ),
                'adminUrl'     => esc_url_raw( admin_url() ),
                'usersPageUrl' => esc_url_raw( admin_url( 'users.php' ) ),
                'ajaxUrl'      => esc_url_raw( admin_url( 'admin-ajax.php' ) ),

                'restRoot'     => esc_url_raw( rest_url() ),
                'restBase'     => BaseRestController::REST_NAMESPACE,
                'restNonce'    => wp_create_nonce( 'wp_rest' ),
                'isBlockTheme' => wp_is_block_theme(),

                'usersUrl'     => [
                    'list' => esc_url_raw( admin_url( 'users.php' ) ),
                    'new'  => esc_url_raw(
                        add_query_arg(
                            [
                                'wholesaler' => 'yay_wholesale_b2b',
                                '_wpnonce'   => wp_create_nonce( 'yay-wholesale-create-user' ),
                            ],
                            admin_url( 'user-new.php' )
                        )
                    ),
                    'edit' => esc_url_raw(
                        add_query_arg(
                            [
                                'user_id' => '%USER_ID%',
                            ],
                            admin_url( 'user-edit.php' )
                        )
                    ),
                ],

            ],
            'wholesaleMeta' => [
                'pluginUrl'     => YAYWHOLESALEB2B_PLUGIN_URL,
                'assetsUrl'     => YAYWHOLESALEB2B_PLUGIN_URL . 'assets',

                'version'       => YAYWHOLESALEB2B_VERSION,
                'reviewed'      => get_option( 'yaywholesaleb2b_reviewed', false ),

                'experimentals' => [
                    'wholesale_store_page' => defined( 'YAYWHOLESALEB2B_EXPERIMENTAL_WHOLESALE_STORE_PAGE' ) && YAYWHOLESALEB2B_EXPERIMENTAL_WHOLESALE_STORE_PAGE === true,
                ],
            ],
            'wcMeta'        => [
                'ordersUrl'             => [
                    'list' => esc_url_raw( admin_url( 'edit.php?post_type=shop_order' ) ),
                ],
                'setting_urls'          => [
                    'payment'        => esc_url_raw( admin_url( 'admin.php?page=wc-settings&tab=checkout' ) ),
                    'shipping'       => esc_url_raw( admin_url( 'admin.php?page=wc-settings&tab=shipping' ) ),
                    'templateEditor' => esc_url_raw( admin_url( 'site-editor.php?p=%2Ftemplate&activeView=root' ) ),
                ],
                'currency_data'         => [
                    'currency'     => get_woocommerce_currency(),
                    'symbol'       => html_entity_decode( \get_woocommerce_currency_symbol(), ENT_COMPAT ),
                    'position'     => get_option( 'woocommerce_currency_pos' ),
                    'thousand_sep' => get_option( 'woocommerce_price_thousand_sep' ),
                    'decimal_sep'  => get_option( 'woocommerce_price_decimal_sep' ),
                    'num_decimals' => intval( get_option( 'woocommerce_price_num_decimals' ) ),
                ],
                'payment_methods_info'  => WoocommerceHelper::get_enabled_payment_methods(),
                'shipping_methods_info' => WoocommerceHelper::get_enabled_shipping_methods(),
                'classic_templates'     => TemplatesHelper::get_classic_templates(),
            ],
        ];

        return $meta;
    }
}
