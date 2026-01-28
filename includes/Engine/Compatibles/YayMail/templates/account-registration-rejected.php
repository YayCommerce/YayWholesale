<?php

use YayWholesaleB2B\Engine\Compatibles\YayMail\AccountRegistrationRejected;

defined( 'ABSPATH' ) || exit;

$template = AccountRegistrationRejected::get_instance()->template;

if ( ! empty( $template ) ) {
    $content = $template->get_content( $args );
    yaymail_kses_post_e( $content );
}
