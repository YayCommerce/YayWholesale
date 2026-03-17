<?php

use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationPending;

defined( 'ABSPATH' ) || exit;

$ywhs_template = AccountRegistrationPending::get_instance()->template;

if ( ! empty( $ywhs_template ) ) {
    $ywhs_content = $ywhs_template->get_content( $args );
    yaymail_kses_post_e( $ywhs_content );
}
