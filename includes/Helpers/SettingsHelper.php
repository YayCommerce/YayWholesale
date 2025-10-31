<?php
namespace Yay_Wholesale\Helpers;

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
                'useDefaultForm' => false,
                'fields'         => [
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'First Name',
                        'type'        => 'text',
                        'placeholder' => 'Enter First Name',
                        'columnWidth' => '50%',
                        'deletable'   => true,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Last Name',
                        'type'        => 'text',
                        'placeholder' => 'Enter Last Name',
                        'columnWidth' => '50%',
                        'deletable'   => true,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Email Address',
                        'type'        => 'email',
                        'placeholder' => 'Enter Email Address',
                        'columnWidth' => '100%',
                        'deletable'   => false,
                    ],
                    [
                        'id'          => uniqid( 'field_' ),
                        'label'       => 'Message',
                        'type'        => 'textarea',
                        'placeholder' => 'Enter Message',
                        'columnWidth' => '100%',
                        'deletable'   => true,
                    ],
                ],
            ],

        ];

        return get_option( 'yay_wholesale_settings', $data );
    }
}
