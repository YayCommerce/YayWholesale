<?php

use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationPending;

defined( 'ABSPATH' ) || exit;

$template = AccountRegistrationPending::get_instance()->template;

if ( ! empty( $template ) ) {
    $content = $template->get_content( $args );
    yaymail_kses_post_e( $content );
}
