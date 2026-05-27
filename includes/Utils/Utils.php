<?php
namespace YayWholesaleB2B\Utils;

use DateTime;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** YayWholesaleB2B Utils class */
class Utils {

    public static function is_valid_date_format( $date, $format = 'Y-m-d' ) {
        if ( ! isset( $date ) ) {
            return false;
        }
        $d = DateTime::createFromFormat( $format, $date );
        return $d && $d->format( $format ) === $date;
    }

    /*Woocommerce Checkout Block support */
    public static function is_checkout_blocks() {

        // Return false if not rest api request
        if ( ! self::detect_wc_store_rest_api_doing() ) {
            return false;
        }

        // Return true if force country by checkout blocks page
        if ( 'checkout' === self::get_wc_blocks_page_context() ) {
            return true;
        }

        return false;
    }

    protected static function detect_wc_store_rest_api_doing() {
        if ( ! WC()->is_rest_api_request() ) {
            return false;
        }

        if ( ! isset( $GLOBALS['wp']->query_vars['rest_route'] ) || empty( $GLOBALS['wp']->query_vars['rest_route'] ) ) {
            $rest_route = false;
        } else {
            $rest_route = $GLOBALS['wp']->query_vars['rest_route'];
        }

        return $rest_route && strpos( $rest_route, '/wc/store/' ) === 0;
    }

    protected static function get_wc_blocks_page_context() {
        $page_context = '';

        if ( ! self::detect_wc_store_rest_api_doing() ) {
            return $page_context;
        }

        if ( isset( $_SERVER['HTTP_YAYCURRENCY_WC_BLOCKS_CONTEXT'] ) ) {
            $page_context = sanitize_text_field( wp_unslash( $_SERVER['HTTP_YAYCURRENCY_WC_BLOCKS_CONTEXT'] ) );
        }

        return $page_context;
    }
}
