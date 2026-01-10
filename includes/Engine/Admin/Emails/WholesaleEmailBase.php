<?php
namespace Yay_Wholesale\Engine\Admin\Emails;

use WC_Email;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Base class for all YayWholesale Emails
 */
abstract class WholesaleEmailBase extends WC_Email {

    public function __construct() {

        $this->template_base = __DIR__ . '/templates/';

        $this->init_hooks();
        parent::__construct();
    }

    /*
     * Init hooks
     */
    public function init_hooks() {
        add_filter( 'woocommerce_locate_core_template', [ $this, 'yay_wholesale_handle_locate_core_template' ], 10, 4 );
        add_filter( 'woocommerce_locate_template', [ $this, 'yay_wholesale_handle_locate_template' ], 10, 3 );
    }

    /*
    * Handle locate core template
    */
    public function yay_wholesale_handle_locate_core_template( $file, $template, $template_base, $template_id ) {
        if ( $template_id === $this->id ) {
            return $this->template_base . $template;
        }

        return $file;
    }

    /*
    * Handle locate template
    */
    public function yay_wholesale_handle_locate_template( $template, $template_name, $template_path ) {
        if ( in_array( $template_name, [ $this->template_html, $this->template_plain ], true ) ) {
            return $this->template_base . $template_name;
        }

        return $template;
    }

    /**
     * Return content from the body_content field.
     *
     * @return string
     */
    public function get_email_content() {
        $content = $this->get_option( 'email_content', '' );

        /**
         * Filters the content of a wholesale email.
         *
         * @param string $content The content.
         * @param object|bool $object The object the email is for (e.g customer).
         * @param \WC_Email $email The email object.
         */
        return apply_filters( 'ywhs_email_content_' . $this->id, $this->format_string( $content ), $this->object, $this );
    }

    /*
    * Return default email content
    */
    public function get_default_email_content() {
        return '';
    }


    /*
    * Form fields
    */
    public function init_form_fields() {
        /* translators: %s: list of placeholders */
        $placeholder_text = sprintf( __( 'Available placeholders: %s', 'yay-wholesale' ), '<code>' . implode( '</code>, <code>', array_keys( $this->placeholders ) ) . '</code>' );
        $form_fields      = [
            'enabled'            => [
                'title'   => __( 'Enable/Disable', 'yay-wholesale' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable this email notification', 'yay-wholesale' ),
                'default' => 'yes',
            ],
            'recipient'          => [
                'title'       => __( 'Recipient(s)', 'yay-wholesale' ),
                'type'        => 'text',
                /* translators: %s: WP admin email */
                'description' => sprintf( __( 'Enter recipients (comma separated) for this email. Defaults to %s.', 'yay-wholesale' ), '<code>' . esc_attr( get_option( 'admin_email' ) ) . '</code>' ),
                'placeholder' => '',
                'default'     => '',
                'desc_tip'    => true,
            ],
            'subject'            => [
                'title'       => __( 'Subject', 'yay-wholesale' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_subject(),
                'default'     => '',
            ],
            'heading'            => [
                'title'       => __( 'Email heading', 'yay-wholesale' ),
                'type'        => 'text',
                'desc_tip'    => true,
                'description' => $placeholder_text,
                'placeholder' => $this->get_default_heading(),
                'default'     => '',
            ],
            'email_content'      => [
                'title'       => __( 'Email content', 'yay-wholesale' ),
                'description' => __( 'Text to appear as the main email content.', 'yay-wholesale' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 200px;',
                'placeholder' => __( 'N/A', 'yay-wholesale' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_email_content(),
                'desc_tip'    => true,
            ],
            'additional_content' => [
                'title'       => __( 'Additional content', 'yay-wholesale' ),
                'description' => __( 'Text to appear below the main email content.', 'yay-wholesale' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 75px;',
                'placeholder' => __( 'N/A', 'yay-wholesale' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_additional_content(),
                'desc_tip'    => true,
            ],
            'email_type'         => [
                'title'       => __( 'Email type', 'yay-wholesale' ),
                'type'        => 'select',
                'description' => __( 'Choose which format of email to send.', 'yay-wholesale' ),
                'default'     => 'html',
                'class'       => 'email_type wc-enhanced-select',
                'options'     => $this->get_email_type_options(),
                'desc_tip'    => true,
            ],
        ];

        if ( $this->customer_email ) {
            unset( $form_fields['recipient'] );
        }

        $this->form_fields = $form_fields;
    }
}
