<?php

namespace YayWholesaleB2B;

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
        unload_textdomain( 'yay-wholesale-b2b' );
        load_textdomain( 'yay-wholesale-b2b', YAYWHOLESALEB2B_PLUGIN_DIR . '/languages/yay-wholesale-b2b-' . $locale . '.mo' );
        load_plugin_textdomain( 'yay-wholesale-b2b', false, YAYWHOLESALEB2B_PLUGIN_DIR . '/languages/' );
    }
}
