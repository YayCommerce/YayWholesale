<?php
namespace YayWholesaleB2B\Engine\Admin;

use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;
/**
 * Templates
 */
class Templates {
    use SingletonTrait;

    protected function __construct() {
        add_action( 'init', [ $this, 'register_taxonomy' ], 10, 0 );
    }
}
