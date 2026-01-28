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
            'name'        => 'yaymail_wholesale_request_author_name',
            'description' => 'Wholesale Request Author Name',
            'group'       => 'YayWholesale',
            'callback'    => [ $this, 'get_yaymail_wholesale_request_author_name' ],
        ];

        return $shortcodes;
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
}
