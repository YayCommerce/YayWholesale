<?php

use Yay_Wholesale_B2B\Engine\Compatibles\YayMail\AccountRegistrationApproved;

defined( 'ABSPATH' ) || exit;

$template = AccountRegistrationApproved::get_instance()->template;

if ( ! empty( $template ) ) {
    $content = $template->get_content( $args );
    yaymail_kses_post_e( $content );
}
