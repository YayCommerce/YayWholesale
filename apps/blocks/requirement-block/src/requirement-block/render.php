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

if ( ! defined( 'ABSPATH' ) ) exit;

use YayWholesaleB2B\Helpers\CustomerHelper;
use YayWholesaleB2B\Helpers\RequirementHelper;

$ywhs_wholesale = CustomerHelper::get_current_user_wholesale_role();

$ywhs_wholesale['minOrderQuantity'] = $ywhs_wholesale === null ? 0 : RequirementHelper::get_min_order_quantity($ywhs_wholesale);
$ywhs_wholesale['minOrderAmount'] = $ywhs_wholesale === null ? 0 : RequirementHelper::get_min_order_amount($ywhs_wholesale);

$is_hidden_quantity = 0.0 === (float) $ywhs_wholesale['minOrderQuantity'];
$is_hidden_amount   = 0.0 == (float) $ywhs_wholesale['minOrderAmount'];

wp_interactivity_config(
  'ywhs_wholesale_requirement',
	[
		'wholesale'     => $ywhs_wholesale,
		'admin_url' => admin_url('admin-ajax.php'),
		'plugin_url' => YAYWHOLESALEB2B_PLUGIN_URL,
		'rest_nonce' => wp_create_nonce( 'wp_rest' ),
		'rest_base'  => 'yay-wholesale/v1',
		'is_using_defaut_currency' => apply_filters("ywhs_ajax_using_default_currency", false),
		'currency' => get_woocommerce_currency(),
		'nonce' => wp_create_nonce("get_original_price_in_cart"),
  ]
);

?>
<?php if ($ywhs_wholesale
	// && !($is_hidden_quantity && $is_hidden_amount)
) : ?>
<div
<?php
// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo get_block_wrapper_attributes( [ 'class' => 'ywhs_requirement_section' ] );
?>
	data-wp-interactive="ywhs_wholesale_requirement"
	data-wp-init = "callbacks.getPriceMap"
	data-wp-watch="callbacks.checkMetRequired"
	>
	<div class="ywhs_requirement_header">
		<div class="ywhs_requirement_title">
			<span><?php echo esc_attr_e( 'Wholesale Requirement', 'yay-wholesale-b2b' ); ?></span>
			<span class="ywhs_badge" data-wp-text="state.wholesaleName"></span>
		</div>

		<div class="ywhs_requirement_opener ywhs_rclosed"></div>
	</div>
	<div class="ywhs_requirement_notice_section">
		<div class="ywhs_icon_holder_block">
			<img src="<?php echo( esc_url( YAYWHOLESALEB2B_PLUGIN_URL . 'assets/images/icon/circle-alert.svg' ) ); ?>" width="14" height="14" />
		</div>

		<div class="ywhs_requirement_progress_bar" >
			<div class="ywhs_requirement_notice_block"></div>
			<div class="ywhs_r_base_bar">
				<div class="ywhs_r_value_bar" data-wp-bind--style="state.progressStyle"></div>
			</div>
		</div>
	</div>
	<div class="ywhs_requirement_content" style="display: none;">
		<?php if ( ! $is_hidden_quantity ) : ?>
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale-b2b' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.qtyMet"
					data-wp-text="state.count"
				></span> /<span data-wp-text="state.minQty"></span>
			</span>
		</div>
		<?php endif ?>

		<?php if ( ! $is_hidden_amount ) : ?>
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale-b2b' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.amountMet"
					data-wp-text="state.subtotal"
				></span> /<span data-wp-text="state.minAmount"></span></span>
		</div>
		<?php endif ?>

		<div class="ywhs_requirement_item">
			<span><?php esc_html_e( 'Get discount:', 'yay-wholesale-b2b' ); ?></span>
			<div
				data-wp-bind--class="state.isDiscounted"
				data-wp-text="state.discountText"
			></div>
		</div>
	</div>
</div>
<?php else: ?>
	<div></div>
<?php endif ?>
