<?php
namespace YayWholesaleB2B\Utils;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** YayWholesaleB2B Utils class */
class Utils {

    public static function is_pro() {
        return defined( 'YAYWHOLESALEB2B_IS_PRO' ) && YAYWHOLESALEB2B_IS_PRO;
    }
}
