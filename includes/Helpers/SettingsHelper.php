<?php
namespace YayWholesaleB2B\Helpers;

use WC_Email;

/**
 * Wholesale Settings Helpers
 */
class SettingsHelper {

    public static function get_settings(): array {

        $settings = array_replace_recursive( self::get_default_settings(), get_option( 'yaywholesaleb2b_settings', [] ) );

        return $settings;
    }

    /**
     * Load multiple settings to localize on frontend.
     */
    public static function get_full_settings(): array {
        $settings = self::get_settings();

        return apply_filters( 'ywhs_full_settings', $settings );
    }

    public static function update_settings( array $settings ): bool {
        return update_option( 'yaywholesaleb2b_settings', $settings );
    }

    public static function get_email_content_type( $type ): string {
        switch ( $type ) {
            case 'html':
                return 'text/html';
            case 'plain':
                return 'text/plain';
            default:
                return 'multipart/alternative';
        }
    }

    public static function get_email_templates(): array {

        $wholesale_emails = array_values(
            array_filter(
                WC()->mailer()->get_emails(),
                fn ( $email, $key ) => str_starts_with( $key, 'YayWholesaleB2B_' ),
                ARRAY_FILTER_USE_BOTH
            )
        );

        $wholesale_email_data = array_map(
            fn ( WC_Email $email ) => [
                'id'          => $email->id,
                'status'      => 'yes' === $email->enabled ? true : false,
                'title'       => $email->title,
                'description' => $email->description,
                'type'        => self::get_email_content_type( $email->email_type ),
                'recipients'  => $email->recipient,
                'url'         => add_query_arg(
                    [
                        'page'    => 'wc-settings',
                        'tab'     => 'email',
                        'section' => $email->id,
                    ],
                    admin_url( 'admin.php' )
                ),
            ],
            $wholesale_emails
        );

        return $wholesale_email_data;
    }


    private static function get_default_settings(): array {
        return [
            'general'             => [
                'default_role'         => '',
                'show_wholesale_price' => false,
                'disable_coupon'       => false,
                'disable_tax'          => false,
                'tax_display_mode'     => 'inherit',
                'wholesale_store_page' => 'inherit',
            ],
            'display'             => [
                'price_format'          => 'retail-and-wholesale',
                'wholesale_price_label' => 'Wholesale price',
                'wholesale_price_color' => '#333333',
            ],
            'registration'        => [
                'moderate'                        => true,
                'wholesale_registration_page'     => '',
                'submit_button_label'             => 'Register now',
                'successful_registration_message' => 'Thank you for registering. Your account begin reviewing. Please wait to be approved.',
            ],
            'registration_fields' => [
                'fields' => [
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'First Name',
                        'inputName'   => 'first_name',
                        'type'        => 'text',
                        'placeholder' => 'Enter First Name',
                        'columnWidth' => '50%',
                        'deletable'   => false,
                        'isDefault'   => true,
                        'isRequired'  => true,
                        'isHidden'    => false,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Last Name',
                        'inputName'   => 'last_name',
                        'type'        => 'text',
                        'placeholder' => 'Enter Last Name',
                        'columnWidth' => '50%',
                        'deletable'   => false,
                        'isDefault'   => true,
                        'isRequired'  => true,
                        'isHidden'    => false,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Email Address',
                        'inputName'   => 'email_address',
                        'type'        => 'email',
                        'placeholder' => 'Enter Email Address',
                        'columnWidth' => '100%',
                        'deletable'   => false,
                        'isDefault'   => true,
                        'isRequired'  => true,
                        'isHidden'    => false,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Message',
                        'inputName'   => 'message',
                        'type'        => 'textarea',
                        'placeholder' => 'Enter Message',
                        'columnWidth' => '100%',
                        'deletable'   => false,
                        'isDefault'   => true,
                        'isRequired'  => true,
                        'isHidden'    => false,
                    ],
                ],
            ],
        ];
    }
}
