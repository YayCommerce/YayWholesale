
<?php

use Yay_Wholesale\Helpers\RequestsHelper;
use Yay_Wholesale\Helpers\SettingsHelper;

$settings            = SettingsHelper::get_settings();
$is_autofill         = is_user_logged_in();
$first_name_autofill = '';
$last_name_autofill  = '';
$email_autofill      = '';

if ( $is_autofill ) {
	$user                = wp_get_current_user();
	$first_name_autofill = $user->first_name;
	$last_name_autofill  = $user->last_name;
	$email_autofill      = $user->user_email;
}
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<h4 style="text-align: <?php echo $attributes['titleAlign']; ?>;"><?php echo $attributes['formTitle']; ?></h4>
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
				<div><strong><?php echo esc_html( __( 'Unable to send your request', 'yay-wholesale' ) ); ?></strong></div>
				<span class="ywhs_form_error_msg"></span>
			</div>
		</div>
	</div>
	<form id="ywhs_request_form">
		<div id="ywhs_form_fields_container">
		<?php
		foreach ( $settings['registration_fields']['fields'] as $field ) :
			?>
			<?php if ( !$field['isHidden'] ) : ?>
			<div <?php echo esc_html( $field['columnWidth'] ) === '50%' ? 'class="ywhs_half"' : 'class="ywhs_full"'; ?> >
				<label class="ywhs_requirement_title" for="<?php echo esc_html( $field['id'] ); ?>" >
					<?php echo esc_html( $field['label'] ); ?>
					<div style="color: red">
					<?php
					if ( $field['isRequired'] ) {
						echo '*';
					}
					?>
					</div>
				</label>
				<?php if ( esc_html( $field['type'] ) !== 'textarea' ) : ?>
					<input 
						id="<?php echo esc_html( $field['id'] ); ?>" 
						type="<?php echo esc_html( $field['type'] ); ?>" 
						placeholder="<?php echo esc_html( $field['placeholder'] ); ?>"
						name="<?php echo esc_html( RequestsHelper::label_to_input_name( $field['label'] ) ); ?>" 
						<?php echo( $field['isRequired'] ? 'required' : '' ); ?>
						<?php echo( $field['isDefault'] && 'email' === $field['type'] && $is_autofill ? 'readonly' : '' ); ?>
						<?php if ( $field['isDefault'] && 'email' === $field['type'] ) : ?>
						value="<?php echo esc_html( trim( $email_autofill ) ); ?>" 
						<?php elseif ( $field['isDefault'] && 'text' === $field['type'] && str_contains( $field['label'], __( 'First Name', 'yay-wholesale' ) ) ) : ?>
							value="<?php echo esc_html( trim( $first_name_autofill ) ); ?>" 
						<?php elseif ( $field['isDefault'] && 'text' === $field['type'] && str_contains( $field['label'], __( 'Last Name', 'yay-wholesale' ) ) ) : ?>    
							value="<?php echo esc_html( trim( $last_name_autofill ) ); ?>"
						<?php endif ?>                                
					/>
				<?php else : ?>
					<textarea 
						id="<?php echo esc_html( $field['id'] ); ?>" 
						placeholder="<?php echo esc_html( $field['placeholder'] ); ?>" 
						name="<?php echo esc_html( RequestsHelper::label_to_input_name( $field['label'] ) ); ?>" 
						<?php echo( $field['isRequired'] ? 'required' : '' ); ?>
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

		<button type="submit" ><?php echo esc_html( $settings['registration']['submit_button_label'] ); ?></button>
	</form>

	<h3 id="ywhs_success_notice"><?php echo esc_html( $settings['registration']['successful_registration_message'] ); ?></h3>
</div>
