
<?php

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;

if ( ! defined( 'ABSPATH' ) ) exit;

if ( empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
	$ywhs_cid = wp_generate_uuid4();

	setcookie(
		'yaywholesaleb2b_cid',
		$ywhs_cid,
		time() + MONTH_IN_SECONDS,
		COOKIEPATH,
		COOKIE_DOMAIN,
		is_ssl(),
		true
	);
}

$title_align = isset( $attributes['titleAlign'] ) ? $attributes['titleAlign'] : 'left';
$form_title = isset( $attributes['formTitle'] ) ? $attributes['formTitle'] : '';
?>
<div <?php echo esc_attr(get_block_wrapper_attributes()); ?>>
<h4 style="text-align: <?php echo esc_attr($title_align); ?>;"><?php echo esc_html($form_title); ?></h4>
<?php RegistrationFieldsHelper::render_form(); ?>
</div>
