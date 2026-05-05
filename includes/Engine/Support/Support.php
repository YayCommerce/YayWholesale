<?php
namespace YayWholesaleB2B\Engine\Support;

use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Support class
 */
class Support {
    use SingletonTrait;

    protected function __construct() {
        StorePage::get_instance();
    }
}
