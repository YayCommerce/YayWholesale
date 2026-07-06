<?php

namespace YayWholesaleB2B\Helpers;

defined( 'ABSPATH' ) || exit;

/**
 * Registration fields frontend render helper.
 */
class RegistrationFieldsHelper {

    /**
     * Render the registration form fields grid and submit button.
     */
    public static function render_form_fields(): void {
        $settings     = SettingsHelper::get_settings();
        $fields       = $settings['registration_fields']['fields'];
        $submit_label = $settings['registration']['submit_button_label'];

        $visible_fields = array_values(
            array_filter(
                $fields,
                static function ( $field ) {
                    return empty( $field['isHidden'] );
                }
            )
        );

        include YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/request-form/registration-form-fields.php';
    }

    /**
     * Resolve the grid column class for a registration field.
     *
     * Mirrors RegistrationFieldsPreview:
     * columnWidth === '100%' → full width, otherwise half width.
     *
     * @param array $field Field configuration.
     * @return string
     */
    public static function get_field_column_class( array $field ): string {
        $column_width = $field['columnWidth'] ?? '50%';

        return '100%' === $column_width
            ? 'ywhs_registration_form_field--full'
            : 'ywhs_registration_form_field--half';
    }

    /**
     * Render a single registration field (label + input).
     *
     * @param array  $field        Field configuration.
     * @param bool   $is_autofill  Whether the current user is logged in.
     * @param array  $autofill     Autofill values keyed by inputName.
     * @param string $column_class Optional layout class for the field wrapper.
     */
    public static function render_field( array $field, bool $is_autofill = false, array $autofill = [], string $column_class = '' ): void {
        if ( '' === $column_class ) {
            $column_class = self::get_field_column_class( $field );
        }

        include YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/request-form/registration-field.php';
    }

    /**
     * Render a registration field label.
     *
     * @param array $field Field configuration.
     */
    public static function render_field_label( array $field ): void {
        include YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/request-form/registration-field-label.php';
    }

    /**
     * Render a single registration field input.
     *
     * @param array $field     Field configuration.
     * @param bool  $is_autofill Whether the current user is logged in.
     * @param array $autofill  Autofill values keyed by inputName.
     */
    public static function render_field_input( array $field, bool $is_autofill = false, array $autofill = [] ): void {
        $first_name_autofill = $autofill['first_name'] ?? '';
        $last_name_autofill  = $autofill['last_name'] ?? '';
        $email_autofill      = $autofill['email'] ?? '';

        include YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/request-form/registration-field-input.php';
    }

    /**
     * Check whether the registration fields include an attachment field.
     *
     * @param array $fields Registration fields configuration.
     * @return bool
     */
    public static function has_attachment_fields( array $fields ): bool {
        foreach ( $fields as $field ) {
            if ( ! empty( $field['isHidden'] ) ) {
                continue;
            }

            if ( 'attachment' === ( $field['type'] ?? '' ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Upload attachment fields from REST request.
     *
     * @param \WP_REST_Request $request
     * @return array<string, string>|\WP_Error
     */
    public static function upload_attachment_fields( \WP_REST_Request $request ) {
        $uploaded_files = [];
        $files          = $request->get_file_params();

        if ( empty( $files ) ) {
            return $uploaded_files;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';

        foreach ( $files as $field_name => $file ) {

            if ( empty( $file['tmp_name'] ) || UPLOAD_ERR_OK !== $file['error'] ) {
                continue;
            }

            $result = wp_handle_upload(
                $file,
                [
                    'test_form' => false,
                ]
            );

            if ( isset( $result['error'] ) ) {
                return new \WP_Error(
                    'upload_failed',
                    $result['error'],
                    [ 'status' => 400 ]
                );
            }

            $uploaded_files[ $field_name ] = $result['url'];
        }//end foreach

        return $uploaded_files;
    }

    /**
     * Render the complete request form.
     */
    public static function render_form(): void {
        $settings                        = SettingsHelper::get_settings();
        $successful_registration_message = $settings['registration']['successful_registration_message'];

        include YAYWHOLESALEB2B_PLUGIN_DIR . 'includes/Templates/request-form/registration-form.php';
    }
}
