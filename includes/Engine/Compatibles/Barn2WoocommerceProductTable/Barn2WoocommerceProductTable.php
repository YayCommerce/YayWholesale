<?php
namespace YayWholesaleB2B\Engine\Compatibles\Barn2WoocommerceProductTable;

use YayWholesaleB2B\Utils\SingletonTrait;

use Barn2\Plugin\WC_Product_Table\Util\Settings as WPT_Settings;
use Barn2\Plugin\WC_Product_Table\Util\Util as WPT_Util;
use Barn2\Plugin\WC_Product_Table\Template_Handler as WPT_Template_Handler;
use Barn2\Plugin\WC_Product_Table\Dependencies\Barn2\Table_Generator\Database\Query;
use Barn2\Plugin\WC_Product_Table\Util\Settings;
use Barn2\Plugin\WC_Product_Table\Admin\Table_Generator\Table_Generator;
use YayWholesaleB2B\Helpers\CustomerHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Barn 2 WC Product table Compatible
 */
class Barn2WoocommerceProductTable {
    use SingletonTrait;

    protected function __construct() {

        if ( ! function_exists( '\Barn2\Plugin\WC_Product_Table\wpt' ) ) {
            return;
        }

        // ------1 Template shop mode------
        // Table display (Front shop)
        add_action( 'template_redirect', [ $this, 'maybe_load_product_table_page' ], 11, 0 );
        add_filter( 'wc_product_table_product_purchasable_from_table', [ $this, 'maybe_allow_wholesale_only_variation' ], 10, 2 );
        add_filter( 'wc_product_table_args_id', [ $this, 'set_wholesale_store_table_id' ], 10 );

        // WPT setting (Plugin admin)
        add_action( 'init', [ $this, 'register_ywhs_taxonomy' ], 11, 0 );
        // Update WWP layout options when creating or deleting a table.
        add_filter( 'barn2_table_generator_api_response_data', [ $this, 'wizard_list_update_wwp_layout' ], 10, 3 );
        // Update WWP layout options when editing a table.
        add_filter( 'barn2_table_generator_table_settings', [ $this, 'edit_update_wwp_layout' ], 10, 2 );

        // ------Custom Template shop mode------
        add_filter( 'ywhs_classic_shop_template_list', [ $this, 'add_wpt_templates' ], 10, 1 );
        add_action( 'ywhs_wpt_before_shop_loop', [ WPT_Template_Handler::class, 'disable_default_woocommerce_loop' ] );
        add_action( 'ywhs_wpt_after_shop_loop', [ WPT_Template_Handler::class, 'add_product_table_after_shop_loop' ] );
    }

    /**
     * Register new Taxonomy for WPT Setting.
     *
     * @return void
     */
    public function register_ywhs_taxonomy() {

        if ( taxonomy_exists( 'yay_wholesale_b2b' ) ) {
            return;
        }

        $args = [
            'labels'            => [
                'name'          => __( 'Products By Wholesale Role', 'yay-wholesale-b2b' ),
                'singular_name' => __( 'Yay Wholesale B2B Templates', 'yay-wholesale-b2b' ),
            ],
            'hierarchical'      => false,
            'public'            => true,
            'show_ui'           => false,
            'show_admin_column' => false,
            'show_in_menu'      => false,
            'show_in_nav_menus' => false,
            'show_in_rest'      => true,
            'query_var'         => true,
            'rewrite'           => [ 'slug' => 'yay_wholesale_b2b' ],
            'capabilities'      => [
                'manage_terms' => 'manage_woocommerce',
                'edit_terms'   => 'manage_woocommerce',
                'delete_terms' => 'manage_woocommerce',
                'assign_terms' => 'edit_products',
            ],
        ];

        register_taxonomy( 'yay_wholesale_b2b', 'product', $args );
    }

    /**
     * Maybe load the Product Table.
     *
     * @return void
     */
    public function maybe_load_product_table_page() {
        $layout = '';

        // check if we are viewing as wholesale type user

        if ( ! CustomerHelper::is_current_wholesale_customer() ) {
            return;
        }

        $is_using_custom_templates = apply_filters( 'ywhs_is_using_custom_templates', false );
        if ( ! $is_using_custom_templates ) {
            // If not in using-custom-template mode
            $shop_display = get_option( 'woocommerce_shop_page_display', 'products' );
            if ( ( is_shop() && ( empty( $shop_display )
                    || 'products' === $shop_display
                    || 'both' === $shop_display ) )
            || is_product_category() ) {
                $layout = get_option( 'ywhs_wholesale_layout', 'default' );
                if ( method_exists( 'Barn2\Plugin\WC_Product_Table\Util\Util', 'get_shop_templates_tables' ) ) {
                    $tables   = WPT_Util::get_shop_templates_tables();
                    $override = $layout === 'product_table' && ! isset( $tables['shop_override'] ) && isset( $tables['yay_wholesale_b2b_override'] ) ? true : ( ( $layout === 'default' || ! isset( $tables['yay_wholesale_b2b_override'] ) ) && isset( $tables['shop_override'] ) ? false : '' );
                } else {
                    $wcpt_misc_settings = WPT_Settings::get_setting_misc();
                    $override           = $layout === 'product_table' && empty( $wcpt_misc_settings['shop_override'] ) ? true : ( $layout === 'default' && ! empty( $wcpt_misc_settings['shop_override'] ) ? false : '' );
                }
            } else {
                return;
            }//end if

            if ( $override ) {
                add_action( 'woocommerce_before_shop_loop', [ WPT_Template_Handler::class, 'disable_default_woocommerce_loop' ] );
                add_action( 'woocommerce_after_shop_loop', [ WPT_Template_Handler::class, 'add_product_table_after_shop_loop' ] );
            } else {
                // If product table is active, then make sure to remove the changes for our page.
                remove_action( 'woocommerce_before_shop_loop', [ WPT_Template_Handler::class, 'disable_default_woocommerce_loop' ] );
                remove_action( 'woocommerce_after_shop_loop', [ WPT_Template_Handler::class, 'add_product_table_after_shop_loop' ] );
            }
        }//end if
    }

    /**
     * Add to the classic shop template list.
     *
     * @param   array $templates
     * @return  array
     */
    public function add_wpt_templates( $templates ) {
        $layout = get_option( 'ywhs_wholesale_layout', 'default' );
        if ( $layout === 'product_table' ) {
            $templates[] = [
                'slug' => 'wpt_product_table',
                'name' => 'Barn2 Product Table Template',
                'path' => YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Engine/Compatibles/Barn2WoocommerceProductTable/templates/product-table-shop.php',
            ];
        }

        return $templates;
    }


    /**
     * Modifies the table display setting description to include details about wholesale layout.
     *
     * @param   string $description
     * @return  string $description
     */
    public function custom_table_display_description( $description ) {

        $description .= '<p>' . sprintf(
            // translators: % 1: Settings page link open % 2: Settings page link close < / a >
            __( 'This will only affect your retail customers, as the wholesale layouts are controlled on the wholesale layout settings page.', 'yay-wholesale-b2b' ),
            // Lib_Util::format_link_open( add_query_arg( 'section', 'layout', woocommerce_wholesale_pro()->get_settings_page_url() ) ),
            // '</a>'
        ) . '</p>';

        return $description;
    }

    /**
     * Allow variations with only wholesale prices to be purchased on product tables.
     *
     * @param bool        $purchasable_from_table
     * @param \WC_Product $product
     */
    public function maybe_allow_wholesale_only_variation( $purchasable_from_table, $product ) {
        global $wpdb;

        if ( $purchasable_from_table ) {
            return $purchasable_from_table;
        }

        if ( ! $product->is_type( 'variable' ) ) {
            return $purchasable_from_table;
        }

        $wholesale_role = CustomerHelper::get_current_user_wholesale_role();

        if ( ! $wholesale_role ) {
            return false;
        }

        $variation_ids = $product ? $product->get_children() : [];

        if ( empty( $variation_ids ) ) {
            return false;
        }

        $valid_variation_count = $wpdb->get_var(
            "
			SELECT count(post_id) FROM {$wpdb->postmeta}
			WHERE post_id IN (" . esc_sql( implode( ',', array_map( 'absint', $variation_ids ) ) ) . ")
			AND meta_key='" . esc_sql( $wholesale_role['name'] ) . "'
			AND meta_value >= 0
			AND meta_value != ''
		"
        );

        if ( $valid_variation_count > 0 ) {
            return true;
        }

        return $purchasable_from_table;
    }

    /**
     * Set the table builder id.
     *
     * @param int $table_id
     * @return int
     */
    public function set_wholesale_store_table_id( $table_id ) {
        if ( method_exists( 'Barn2\Plugin\WC_Product_Table\Util\Util', 'get_shop_templates_tables' ) ) {
            $shop_templates_tables = WPT_Util::get_shop_templates_tables();
            if ( is_shop() || is_product_category() ) {
                if ( get_option( 'ywhs_wholesale_layout', 'default' ) === 'product_table' ) {
                    return $shop_templates_tables['yay_wholesale_b2b_override']['id'];
                }
            }
        }
        return $table_id;
    }

    /**
     * Update WWP layout options when creating or deleting a table.
     *
     * @param  mixed $data
     * @param  mixed $class_function
     * @param  mixed $type
     * @return mixed
     */
    public function wizard_list_update_wwp_layout( $data, $class_function, $type ) {

        $tables = WPT_Util::get_shop_templates_tables();

        // While creating a table in the Wizard.
        if ( $type === 'success' && isset( $class_function['class'] ) && basename( str_replace( '\\', '/', $class_function['class'] ) ) === 'Tables' && $class_function['function'] === 'set_table_completed' ) {
            if ( isset( $tables['yay_wholesale_b2b_override'] ) ) {
                update_option( 'ywhs_wholesale_layout', 'product_table' );
                self::delete_previous_wholesale_reference();
            }
        }

        // When deleting a table.
        if ( $type === 'success' && isset( $class_function['class'] ) && basename( str_replace( '\\', '/', $class_function['class'] ) ) === 'Tables' && $class_function['function'] === 'delete_table' ) {
            if ( ! isset( $tables['yay_wholesale_b2b_override'] ) ) {
                update_option( 'ywhs_wholesale_layout', 'default' );
                self::delete_previous_wholesale_reference();
            }
        }

        return $data;
    }

    /**
     * Update WWP layout options when editing a table.
     *
     * @param  mixed $settings
     * @param  mixed $table_id
     * @return mixed
     */
    public function edit_update_wwp_layout( $settings, $table_id ) {

        $tables = WPT_Util::get_shop_templates_tables();

        if ( isset( $settings['yay_wholesale_b2b_override'] ) && $settings['yay_wholesale_b2b_override'] === true && get_option( 'ywhs_wholesale_layout', 'default' ) === 'default' ) {
            update_option( 'ywhs_wholesale_layout', 'product_table' );
        } elseif ( isset( $tables['yay_wholesale_b2b_override'] ) && $tables['yay_wholesale_b2b_override']['id'] === (int) $table_id
            && ( ! isset( $settings['yay_wholesale_b2b_override'] ) || $settings['yay_wholesale_b2b_override'] === false )
            && ( get_option( 'ywhs_wholesale_layout', 'default' ) === 'product_table' )
        ) {
            update_option( 'ywhs_wholesale_layout', 'default' );

            self::delete_previous_wholesale_reference();

            // Sets the previous wholesale store table as the current table.
            $settings['previous_yay_wholesale_b2b_override'] = true;
        }
        return $settings;
    }

    /**
     * Deletes the previous wholesale store override table reference.
     */
    public static function delete_previous_wholesale_reference() {

        $tables = WPT_Util::get_shop_templates_tables();

        if ( isset( $tables['previous_yay_wholesale_b2b_override'] ) ) {

            $table_id = $tables['previous_yay_wholesale_b2b_override']['id'];

            $query          = new Query( 'wpt' );
            $table          = $query->get_item( $table_id );
            $table_settings = $table->get_settings();

            unset( $table_settings['previous_yay_wholesale_b2b_override'] );

            $query->update_item(
                $table_id,
                [
                    'settings' => wp_json_encode( $table_settings ),
                ]
            );
        }
    }

    /**
     * Checks if wholesale store option can be checked or if a new wholesale table should be created.
     *
     * @return void
     */
    public static function maybe_create_wholesale_table() {
        $tables = WPT_Util::get_shop_templates_tables();

        if ( ( ! isset( $tables['yay_wholesale_b2b_override'] ) || ! $tables['yay_wholesale_b2b_override'] ) ) {

            // If there is a previous wholesale store defined.
            if ( isset( $tables['previous_yay_wholesale_b2b_override'] ) ) {

                $table_id = $tables['previous_yay_wholesale_b2b_override']['id'];

                $query          = new Query( 'wpt' );
                $table          = $query->get_item( $table_id );
                $table_settings = $table->get_settings();

                $table_settings['yay_wholesale_b2b_override'] = true;
                $table_settings['table_display']              = 'shop_page';

                $query->update_item(
                    $table_id,
                    [
                        'settings' => wp_json_encode( $table_settings ),
                    ]
                );

            } else {
                self::create_wholesale_table();
            }//end if
        }//end if
    }

    /**
     * Creates the wholesale database table.
     *
     * @return void
     */
    public static function create_wholesale_table() {

        self::delete_previous_wholesale_reference();

        $title    = __( 'Yay Wholesale order form', 'yay-wholesale-b2b' );
        $settings = [
            'table_display'              => 'shop_page',
            'yay_wholesale_b2b_override' => true,
        ];

        $misc = Settings::get_setting_misc();

        foreach ( $misc as $k => $v ) {
            if ( substr( $k, -9 ) === '_override' ) {
                $settings[ $k ] = false;
            }
        }

        Table_Generator::create_table( $title, $settings );
    }

    /**
     * Checks if wholesale store option can be unchecked or if the table should be converted to manual.
     */
    public static function maybe_remove_wholesale_table() {
        $tables = WPT_Util::get_shop_templates_tables();

        if ( ! isset( $tables['yay_wholesale_b2b_override'] ) ) {
            return;
        }

        $table_id = $tables['yay_wholesale_b2b_override']['id'];

        $query = new Query( 'wpt' );

        $table          = $query->get_item( $table_id );
        $table_settings = $table->get_settings();

        // Deselects the wholesale store option.
        unset( $table_settings['yay_wholesale_b2b_override'] );

        // If the wholesale store option is the only selected, then change the display to shortcode.
        $table_settings['table_display'] = 'manual';
        foreach ( $table_settings as $key => $value ) {
            if ( substr( $key, -9 ) === '_override' && $key !== 'previous_yay_wholesale_b2b_override' && $value === true ) {
                $table_settings['table_display'] = 'shop_page';
                break;
            }
        }

        $table_settings['previous_yay_wholesale_b2b_override'] = true;

        $query->update_item(
            $table_id,
            [
                'settings' => wp_json_encode( $table_settings ),
            ]
        );
    }
}
