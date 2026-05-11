<?php
namespace YayWholesaleB2B\Engine\Compatibles\YayMail;

use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 *  Request Shortcode for yaymail compatible
 */
class RequestShortcode extends \YayMail\Abstracts\BaseShortcode {
    use SingletonTrait;

    public $available_email_ids = [ YAYMAIL_NON_ORDER_EMAILS ];

    public function get_shortcodes() {
        // Define your function here
        $shortcodes = [];

        $shortcodes[] = [
            'name'        => 'yaymail_wholesale_admin_name',
            'description' => 'Wholesale Request Author Email',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_admin_name' ],
        ];

        $shortcodes[] = [
            'name'        => 'yaymail_wholesale_request_author_name',
            'description' => 'Wholesale Request Author Name',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_request_author_name' ],
        ];

        $shortcodes[] = [
            'name'        => 'yaymail_wholesale_request_author_email',
            'description' => 'Wholesale Request Author Email',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_request_author_email' ],
        ];

        $shortcodes[] = [
            'name'        => 'yaymail_wholesale_request_create_time',
            'description' => 'Wholesale Request Registration Time',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_request_create_time' ],
        ];

        $shortcodes[] = [
            'name'        => 'yaymail_wholesale_request_admin_url',
            'description' => 'Wholesale Request Admin URL',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_request_admin_url' ],
        ];

        return $shortcodes;
    }

    public function get_yaymail_wholesale_admin_name( $data ) {
        $render_data = isset( $data['render_data'] ) ? $data['render_data'] : [];

        if ( ! empty( $render_data['is_sample'] ) ) {
            /**
             * Is sample order
             */
            return __( 'Admin', 'yay-wholesale-b2b' );
        }
        return isset( $data['render_data']['placeholders']['{admin_name}'] ) ? $data['render_data']['placeholders']['{admin_name}'] : '';
    }

    public function get_yaymail_wholesale_request_author_name( $data ) {
        $render_data = isset( $data['render_data'] ) ? $data['render_data'] : [];

        if ( ! empty( $render_data['is_sample'] ) ) {
            /**
             * Is sample order
             */
            return __( 'Wholesalers', 'yay-wholesale-b2b' );
        }
        return isset( $data['render_data']['placeholders']['{account_name}'] ) ? $data['render_data']['placeholders']['{account_name}'] : '';
    }

    public function get_yaymail_wholesale_request_author_email( $data ) {
        $render_data = isset( $data['render_data'] ) ? $data['render_data'] : [];

        if ( ! empty( $render_data['is_sample'] ) ) {
            /**
             * Is sample order
            */
            return __( 'johndoe@email.com', 'yay-wholesale-b2b' );
        }
        return isset( $data['render_data']['placeholders']['{account_email}'] ) ? $data['render_data']['placeholders']['{account_email}'] : '';
    }

    public function get_yaymail_wholesale_request_create_time( $data ) {
        $render_data = isset( $data['render_data'] ) ? $data['render_data'] : [];

        if ( ! empty( $render_data['is_sample'] ) ) {
            /**
             * Is sample order
             */
            return wp_date(
                get_option( 'date_format' ) . ' ' . get_option( 'time_format' )
            );
        }
        return isset( $data['render_data']['placeholders']['{account_registration_time}'] ) ? $data['render_data']['placeholders']['{account_registration_time}'] : '';
    }

    public function get_yaymail_wholesale_request_admin_url( $data ) {
        $render_data = isset( $data['render_data'] ) ? $data['render_data'] : [];

        if ( ! empty( $render_data['is_sample'] ) ) {
            /**
             * Is sample order
             */
            return admin_url( 'admin.php?page=yay_wholesale#/requests/' );
        }
        return isset( $data['render_data']['placeholders']['{admin_url}'] ) ? $data['render_data']['placeholders']['{admin_url}'] : '';
    }
}
