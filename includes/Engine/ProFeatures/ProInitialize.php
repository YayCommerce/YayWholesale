<?php
namespace YayWholesaleB2B\Engine\ProFeatures;

use YayWholesaleB2B\Utils\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Pro Features Initalize
 */
class ProInitialize {
    use SingletonTrait;

    protected function __construct() {
        Requirement::get_instance();
    }
}
