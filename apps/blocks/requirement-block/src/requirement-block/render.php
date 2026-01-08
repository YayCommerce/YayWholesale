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

use Yay_Wholesale\Helpers\RolesHelper;

$wholesale = RolesHelper::is_wholesale_user();

 wp_interactivity_config(
    'ywhs_wholesale_requirement',
    [
		'wholesale'     => $wholesale,
		'currency_data' => [
			'currency'     => get_woocommerce_currency(),
			'symbol'       => html_entity_decode( \get_woocommerce_currency_symbol(), ENT_COMPAT ),
			'position'     => get_option( 'woocommerce_currency_pos' ),
			'thousand_sep' => get_option( 'woocommerce_price_thousand_sep' ),
			'decimal_sep'  => get_option( 'woocommerce_price_decimal_sep' ),
			'num_decimals' => intval( get_option( 'woocommerce_price_num_decimals' ) ),
		],
		'rest_url'   => esc_url_raw( rest_url() ),
		'rest_nonce' => wp_create_nonce( 'wp_rest' ),
		'rest_base'  => 'yay-wholesale/v1',
    ]
    );

?>
<?php if ($wholesale) : ?>
<div 
<?php echo get_block_wrapper_attributes( [ 'class' => 'ywhs_requirement_section' ] ); ?>
	data-wp-interactive="ywhs_wholesale_requirement"
	data-wp-watch="callbacks.CheckMetRequired"
	>
	<div class="ywhs_requirement_header">
		<div class="ywhs_requirement_title">
			<span><?php echo esc_attr_e( 'Wholesale Requirement', 'yay-wholesale' ); ?></span>
			<span class="ywhs_badge" data-wp-text="state.wholesaleName"></span>
		</div>

		<div class="ywhs_requirement_opener ywhs_rclosed"></div>
	</div>
	<div class="ywhs_requirement_notice_section">
		<div class="ywhs_icon_holder_block">
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.75 0.75H2.14721L4.00549 9.46581C4.07366 9.78501 4.25047 10.0704 4.50549 10.2727C4.76051 10.4751 5.07778 10.5818 5.40269 10.5746H12.235C12.553 10.5741 12.8613 10.4646 13.109 10.2643C13.3567 10.064 13.5289 9.78478 13.5973 9.47283L14.75 4.25878H2.89471M5.60543 14.0482C5.60543 14.4358 5.29265 14.75 4.90682 14.75C4.521 14.75 4.20822 14.4358 4.20822 14.0482C4.20822 13.6607 4.521 13.3465 4.90682 13.3465C5.29265 13.3465 5.60543 13.6607 5.60543 14.0482ZM13.2901 14.0482C13.2901 14.4358 12.9773 14.75 12.5915 14.75C12.2056 14.75 11.8929 14.4358 11.8929 14.0482C11.8929 13.6607 12.2056 13.3465 12.5915 13.3465C12.9773 13.3465 13.2901 13.6607 13.2901 14.0482Z" 
                    stroke="#2271B1" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
		</div>

		<div class="ywhs_requirement_progress_bar" >
			<div class="ywhs_requirement_notice_block"></div>
			<div class="ywhs_r_base_bar">
				<div class="ywhs_r_value_bar" data-wp-bind--style="state.progressStyle"></div>
			</div>
		</div>
	</div>
	<div class="ywhs_requirement_content" style="display: none;">
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order quantity:', 'yay-wholesale' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.qtyMet"
					data-wp-text="state.count"
				></span> /<span data-wp-text="state.minQty"></span>
			</span>
		</div>
		<div class="ywhs_requirement_item">
			<span><?php echo esc_attr_e( 'Min order amount:', 'yay-wholesale' ); ?></span>
			<span class="ywhs_r_base_notice">
				<span
					data-wp-bind--class="state.amountMet"
					data-wp-text="state.subtotal"
				></span> /<span data-wp-text="state.minAmount"></span></span>
		</div>
		<div class="ywhs_requirement_item">
			<span><?php esc_html_e( 'Get discount:', 'yay-wholesale' ); ?></span>
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