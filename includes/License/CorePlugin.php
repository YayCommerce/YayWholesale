<?php

namespace YayWholesaleB2B\License;

defined( 'ABSPATH' ) || exit;

/**
 * Core Plugin
 */
class CorePlugin {

    public static function get( $name ) {
        $data = [
            'path'        => YAYWHOLESALEB2B_PLUGIN_DIR,
            'url'         => YAYWHOLESALEB2B_PLUGIN_URL,
            'basename'    => YAYWHOLESALEB2B_BASE_NAME,
            'version'     => YAYWHOLESALEB2B_VERSION,
            'slug'        => 'yay_wholesale_b2b_pro',
            'link'        => 'https://yaycommerce.com/yay-wholesale-b2b-for-woocommerce/',
            'download_id' => '66637',
        ];

        if ( isset( $data[ $name ] ) ) {
            return $data[ $name ];
        }
        return null;
    }
}
