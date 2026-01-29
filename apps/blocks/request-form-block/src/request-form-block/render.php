
<?php

use YayWholesaleB2B\Helpers\RequestsHelper;
use YayWholesaleB2B\Helpers\SettingsHelper;

if ( ! defined( 'ABSPATH' ) ) exit;

$ywhs_settings            = SettingsHelper::get_settings();
$ywhs_is_autofill         = is_user_logged_in();
$ywhs_first_name_autofill = '';
$ywhs_last_name_autofill  = '';
$ywhs_email_autofill      = '';

if ( $ywhs_is_autofill ) {
	$ywhs_user                = wp_get_current_user();
	$ywhs_first_name_autofill = $ywhs_user->first_name;
	$ywhs_last_name_autofill  = $ywhs_user->last_name;
	$ywhs_email_autofill      = $ywhs_user->user_email;
}

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

?>
<div <?php echo esc_attr(get_block_wrapper_attributes()); ?>>
	<h4 style="text-align: <?php echo esc_attr($attributes['titleAlign']); ?>;"><?php echo esc_html($attributes['formTitle']); ?></h4>
	<div class="ywhs_request_form_error">
		<div>
			<svg xmlns="http://www.w3.org/2000/svg" 
			width="18" 
			height="18" 
			viewBox="0 0 24 24" 
			fill="none" 
			stroke="red" 
			stroke-width="2.5" 
			stroke-linecap="round" 
			stroke-linejoin="round" 
			class="lucide lucide-circle-alert-icon lucide-circle-alert">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" x2="12" y1="8" y2="12"/>
				<line x1="12" x2="12.01" y1="16" y2="16"/>
			</svg>
			<div class="ywhs_form_error_content">
				<div><strong><?php echo esc_html( __( 'Unable to send your request', 'yay-wholesale-b2b' ) ); ?></strong></div>
				<span class="ywhs_form_error_msg"></span>
			</div>
		</div>
	</div>
	<form id="ywhs_request_form">
		<div id="ywhs_form_fields_container">
		<?php
		foreach ( $ywhs_settings['registration_fields']['fields'] as $ywhs_field ) :
			?>
			<?php if ( !$ywhs_field['isHidden'] ) : ?>
			<div <?php echo esc_html( $ywhs_field['columnWidth'] ) === '50%' ? 'class="ywhs_half"' : 'class="ywhs_full"'; ?> >
				<label class="ywhs_requirement_title" for="<?php echo esc_html( $ywhs_field['id'] ); ?>" >
					<?php echo esc_html( $ywhs_field['label'] ); ?>
					<div style="color: red">
					<?php
					if ( $ywhs_field['isRequired'] ) {
						echo '*';
					}
					?>
					</div>
				</label>
				<?php if ( esc_html( $ywhs_field['type'] ) !== 'textarea' ) : ?>
					<input 
						id="<?php echo esc_html( $ywhs_field['id'] ); ?>" 
						type="<?php echo esc_html( $ywhs_field['type'] ); ?>" 
						placeholder="<?php echo esc_html( $ywhs_field['placeholder'] ); ?>"
						name="<?php echo esc_html( RequestsHelper::label_to_input_name( $ywhs_field['label'] ) ); ?>" 
						<?php echo( $ywhs_field['isRequired'] ? 'required' : '' ); ?>
						<?php echo( $ywhs_field['isDefault'] && 'email' === $ywhs_field['type'] && $ywhs_is_autofill ? 'readonly' : '' ); ?>
						<?php if ( $ywhs_field['isDefault'] && 'email' === $ywhs_field['type'] ) : ?>
						value="<?php echo esc_html( trim( $ywhs_email_autofill ) ); ?>" 
						<?php elseif ( $ywhs_field['isDefault'] && 'text' === $ywhs_field['type'] && str_contains( $ywhs_field['label'], __( 'First Name', 'yay-wholesale-b2b' ) ) ) : ?>
							value="<?php echo esc_html( trim( $ywhs_first_name_autofill ) ); ?>" 
						<?php elseif ( $ywhs_field['isDefault'] && 'text' === $ywhs_field['type'] && str_contains( $ywhs_field['label'], __( 'Last Name', 'yay-wholesale-b2b' ) ) ) : ?>    
							value="<?php echo esc_html( trim( $ywhs_last_name_autofill ) ); ?>"
						<?php endif ?>                                
					/>
				<?php else : ?>
					<textarea 
						id="<?php echo esc_html( $ywhs_field['id'] ); ?>" 
						placeholder="<?php echo esc_html( $ywhs_field['placeholder'] ); ?>" 
						name="<?php echo esc_html( RequestsHelper::label_to_input_name( $ywhs_field['label'] ) ); ?>" 
						<?php echo( $ywhs_field['isRequired'] ? 'required' : '' ); ?>
						></textarea>
				<?php endif ?>
			</div>
				<?php
			endif
			?>
			<?php
			endforeach;
		?>
		</div>

		<button type="submit" ><?php echo esc_html( $ywhs_settings['registration']['submit_button_label'] ); ?></button>
	</form>

	<h3 id="ywhs_success_notice"><?php echo esc_html( $ywhs_settings['registration']['successful_registration_message'] ); ?></h3>
</div>
