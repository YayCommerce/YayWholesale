<?php
namespace YayWholesaleB2B\Helpers;

use YayWholesaleB2B\Helpers\RolesHelper;

/**
 * WholeSalers Helper Class
 */
class MigrationHelper {
    const LAST_MIGRATION_VERSION = 'yaywholesaleb2b_version';

    public static function migrate_data() {
        $migrations   = self::get_available_migrations();
        $last_version = get_option( self::LAST_MIGRATION_VERSION, '0.0.0' );

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

        update_option( self::LAST_MIGRATION_VERSION, YAYWHOLESALEB2B_VERSION );
    }

    public static function get_available_migrations() {
        return [
            [ self::class, 'v1_0_5_add_input_name_for_registration_fields_settings' ],
        ];
    }

    public static function v1_0_5_add_input_name_for_registration_fields_settings( string $last_version ) {
        if ( ! version_compare( $last_version, '1.0.5', '<=' ) ) {
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

        return $setting;
    }
}
