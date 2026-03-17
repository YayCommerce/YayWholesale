<?php
namespace YayWholesaleB2B\Helpers;

use WC_Email;

/**
 * Settings Helper Class
 */
class SettingsHelper {

    /**
     * Get the settings
     *
     * @return array The settings.
     */
    public static function get_settings(): array {

        $data = [
            'general'             => [
                'default_role'         => '',
                'show_wholesale_price' => false,
                'disable_coupon'       => false,
                'disable_tax'          => false,
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

        return get_option( 'yaywholesaleb2b_settings', $data );
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
}
