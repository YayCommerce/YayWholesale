<?php
namespace Yay_Wholesale\Engine;

use Yay_Wholesale\Engine\Compatibles\YayCurrency;
use Yay_Wholesale\Utils\SingletonTrait;

/**
 * Compatibles
 */
class Compatibles {
    use SingletonTrait;

    protected function __construct() {
        YayCurrency::get_instance();
    }
}
