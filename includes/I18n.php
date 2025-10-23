<?php

namespace Yay_Wholesale;

defined( 'ABSPATH' ) || exit;
/**
 * I18n Logic
 */
class I18n {

    public static function load_plugin_textdomain() {
        if ( function_exists( 'determine_locale' ) ) {
            $locale = determine_locale();
        } else {
            $locale = is_admin() ? get_user_locale() : get_locale();
        }
        unload_textdomain( 'yay-wholesale' );
        load_textdomain( 'yay-wholesale', YAY_WHOLESALE_PLUGIN_DIR . '/languages/yay-wholesale-' . $locale . '.mo' );
        load_plugin_textdomain( 'yay-wholesale', false, YAY_WHOLESALE_PLUGIN_DIR . '/languages/' );
    }
}
