<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<div 
<?php echo get_block_wrapper_attributes( [ 'class' => 'yywhs_requirement_section' ] ); ?>
data-wp-interactive="ywhs_wholesale_requirement"
    data-wp-init="callbacks.init"
	data-wp-watch="callbacks.watchCartUpdates"
	>
	<div class="ywhs_requirement_header">
		<div class="ywhs_requirement_title">
			<span><?php echo esc_attr_e( 'Wholesale Requirement', 'yay-wholesale' ); ?></span>
			<span class="ywhs_badge" data-wp-text="state.wholesaleName"></span>
		</div>

		<div class="ywhs_requirement_opener ywhs_rclosed"></div>
	</div>
	<div class="ywhs_requirement_progress_bar">
		<div class="ywhs_requirement_notice" data-wp-text="state.notice">
		</div>
		<div class="ywhs_r_base_bar">
			<div class="ywhs_r_value_bar" data-wp-bind--style="state.progressStyle"></div>
		</div>
	</div>
	<div class="ywhs_requirement_content" style="display: none;">
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.qtyMet ? 'ywhs_r_notice' : ''"
					data-wp-text="state.count"
				></span> /<span data-wp-text="state.minQty"></span>
			</span>
		</div>
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.amountMet ? 'ywhs_r_notice' : ''"
					data-wp-text="state.subtotal"
				></span> /<span data-wp-text="state.minAmount"></span></span>
		</div>
		<div class="ywhs_requirement_item">
			<span><?php esc_html_e( 'Get discount:', 'yay-wholesale' ); ?></span>
			<div
				data-wp-bind--class="state.isDiscounted ? 'ywhs_r_notice' : 'ywhs_r_base_notice'"
				data-wp-text="state.discountText"
			></div>
		</div>
	</div>
</div>