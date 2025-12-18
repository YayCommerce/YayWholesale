
<?php

use Yay_Wholesale\Helpers\RequestsHelper;
use Yay_Wholesale\Helpers\SettingsHelper;

$settings = SettingsHelper::get_settings();
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
	<h4 style="text-align: <?php echo $attributes['titleAlign']; ?>;"><?php echo $attributes['formTitle']; ?></h4>
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
