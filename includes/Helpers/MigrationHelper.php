<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * WholeSalers Helper Class
 */
class MigrationHelper {
    const CORE_DB_VERSION = 'yaywholesaleb2b_version';

    public static function get_core_db_version() {
        return get_option( self::CORE_DB_VERSION, '0.0.0' );
    }

    public static function migrate_data() {
        $migrations   = self::get_available_migrations();
        $last_version = self::get_core_db_version();

        if ( version_compare( $last_version, YAYWHOLESALEB2B_VERSION, '=' ) ) {
            return;
        }

        if ( ! empty( $last_version ) ) {
            foreach ( $migrations as $migration ) {
                if ( is_callable( $migration ) ) {
                    call_user_func( $migration, $last_version );
                }
            }
        }

        update_option( self::CORE_DB_VERSION, YAYWHOLESALEB2B_VERSION );
    }

    public static function get_available_migrations() {
        return [
            [ self::class, 'v1_0_5_add_input_name_for_registration_fields_settings' ],
            [ self::class, 'v1_2_0_refactor_product_based_discount_settings' ],
        ];
    }

    public static function v1_0_5_add_input_name_for_registration_fields_settings( string $last_version ) {
        if ( ! version_compare( $last_version, '1.0.5', '<' ) ) {
            return;
        }

        $setting              = SettingsHelper::get_settings();
        $has_first_name       = false;
        $has_last_name        = false;
        $custom_field_counter = 0;

        foreach ( $setting['registration_fields']['fields'] as &$field ) {
            if ( isset( $field['inputName'] ) && ! empty( $field['inputName'] ) ) {
                continue;
            }
            if ( ! $field['isDefault'] ) {
                $field['inputName'] = 'custom_field_' . ( ++$custom_field_counter );
            } else {
                if ( 'email' === $field['type'] ) {
                    $field['inputName'] = 'email_address';
                    continue;
                }

                if ( 'textarea' === $field['type'] ) {
                    $field['inputName'] = 'message';
                    continue;
                }

                if ( str_contains( strtolower( $field['label'] ), __( 'first name', 'yay-wholesale-b2b' ) ) ) {
                    $field['inputName'] = 'first_name';
                    $has_first_name     = true;
                    continue;
                }

                if ( str_contains( strtolower( $field['label'] ), __( 'last name', 'yay-wholesale-b2b' ) ) ) {
                    $field['inputName'] = 'last_name';
                    $has_last_name      = true;
                    continue;
                }

                if ( ! $has_first_name ) {
                    $field['inputName'] = 'first_name';
                    $has_first_name     = true;
                    continue;
                }

                if ( ! $has_last_name ) {
                    $field['inputName'] = 'last_name';
                    $has_last_name      = true;
                    continue;
                }
            }//end if
        }//end foreach

        update_option( 'yaywholesaleb2b_settings', $setting );
    }

    public static function v1_2_0_refactor_product_based_discount_settings( string $last_version ) {
        if ( ! version_compare( $last_version, '1.2.0', '<' ) ) {
            return;
        }

        $args = [
            'post_type'              => [ 'product', 'product_variation' ],
            'posts_per_page'         => -1,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                [
                    'key'     => 'yaywholesaleb2b_product_based_discount',
                    'compare' => 'EXIST',
                ],
            ],
        ];

        $query    = new \WP_Query( $args );
        $products = $query->posts;
        if ( empty( $products ) ) {
            return;
        }

        foreach ( $products as $product ) {
            $discount = get_post_meta( $product->ID, 'yaywholesaleb2b_product_based_discount', true );
            if ( 'fixed' === $discount['discount_type'] || 'rate' === $discount['discount_type'] ) {
                $new_value = [];
                $is_fixed  = 'fixed' === $discount['discount_type'];
                foreach ( $discount['discount_fixed'] as $role => $fixed ) {
                    $new_value[ $role ] = [
                        'type'  => $is_fixed ? 'fixed' : 'rate',
                        'fixed' => $fixed,
                        'rate'  => $discount['discount_rates'][ $role ],
                    ];
                }

                $discount['discount_type']                  = 'by_role';
                $discount['discount_by_role']['wholesaler'] = $new_value;
                unset( $discount['discount_fixed'] );
                unset( $discount['discount_rates'] );

                update_post_meta( $product->ID, 'yaywholesaleb2b_product_based_discount', $discount );
            }
        }//end foreach
    }
}
