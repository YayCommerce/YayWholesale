<?php

namespace YayWholesaleB2B\Pro\Helpers\AccessHelpers;

use YayWholesaleB2B\Helpers\SettingsHelper;

/**
 * Guest Access Helper
 */
class GuestAccessHelper {
    public static function get_guest_access_rule( $settings = null ) {
        if ( ! isset( $settings ) ) {
            $settings = SettingsHelper::get_settings();
        }

        return $settings['general']['guest_access_rule'] ?? 'no-restriction';
    }
}
