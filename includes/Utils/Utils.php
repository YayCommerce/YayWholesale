<?php
namespace YayWholesaleB2B\Utils;

use DateTime;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** YayWholesaleB2B Utils class */
class Utils {

    public static function is_pro() {
        return defined( 'YAYWHOLESALEB2B_IS_PRO' ) && YAYWHOLESALEB2B_IS_PRO;
    }

    public static function is_valid_date_format( $date, $format = 'Y-m-d' ) {
        if ( ! isset( $date ) ) {
            return false;
        }
        $d = DateTime::createFromFormat( $format, $date );
        return $d && $d->format( $format ) === $date;
    }
}
