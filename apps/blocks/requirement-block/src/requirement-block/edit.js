/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the className name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit() {
	return (
		<div { ...useBlockProps() }>
			<div className="ywhs_requirement_section" >
				<div className="ywhs_requirement_header">
					<div className="ywhs_requirement_title">
						<span>{__('Wholesale Requirement', 'yay-wholesale' )}</span>
						<span className="ywhs_badge">YayWholesale</span>
					</div>

					<div className="ywhs_requirement_opener ywhs_rclosed"></div>
				</div>
				<div className="ywhs_requirement_notice_section">
					<div className="ywhs_icon_holder">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.85472 5.64701L5.65601 9.84737M5.65601 5.64701H5.66301M9.85472 9.84737H9.86172M2.05225 5.38105C1.95011 4.92078 1.9658 4.44216 2.09785 3.98957C2.2299 3.53698 2.47405 3.12507 2.80765 2.79203C3.14125 2.459 3.55351 2.21562 4.0062 2.08446C4.45889 1.95331 4.93735 1.93862 5.39723 2.04176C5.65034 1.64574 5.99904 1.31983 6.41118 1.09408C6.82332 0.868329 7.28563 0.75 7.7555 0.75C8.22537 0.75 8.68768 0.868329 9.09982 1.09408C9.51196 1.31983 9.86066 1.64574 10.1138 2.04176C10.5744 1.93817 11.0536 1.95279 11.507 2.08427C11.9605 2.21574 12.3733 2.4598 12.7071 2.79373C13.0409 3.12767 13.2848 3.54064 13.4163 3.99423C13.5477 4.44782 13.5623 4.92729 13.4587 5.38805C13.8546 5.64127 14.1804 5.99011 14.4061 6.40241C14.6317 6.8147 14.75 7.2772 14.75 7.74726C14.75 8.21731 14.6317 8.67981 14.4061 9.09211C14.1804 9.50441 13.8546 9.85324 13.4587 10.1065C13.5618 10.5665 13.5472 11.0452 13.4161 11.498C13.285 11.9509 13.0417 12.3633 12.7088 12.6971C12.3759 13.0308 11.9641 13.275 11.5117 13.4071C11.0593 13.5392 10.5809 13.5549 10.1208 13.4527C9.86798 13.8503 9.51901 14.1776 9.10617 14.4044C8.69333 14.6311 8.22997 14.75 7.759 14.75C7.28803 14.75 6.82466 14.6311 6.41183 14.4044C5.99899 14.1776 5.65001 13.8503 5.39723 13.4527C4.93735 13.5559 4.45889 13.5412 4.0062 13.4101C3.55351 13.2789 3.14125 13.0355 2.80765 12.7025C2.47405 12.3694 2.2299 11.9575 2.09785 11.5049C1.9658 11.0524 1.95011 10.5737 2.05225 10.1135C1.65335 9.86091 1.32477 9.51153 1.09708 9.09782C0.869396 8.68412 0.75 8.21952 0.75 7.74726C0.75 7.27499 0.869396 6.8104 1.09708 6.39669C1.32477 5.98298 1.65335 5.6336 2.05225 5.38105Z" 
							stroke="#2271B1" 
							stroke-width="1.5" 
							stroke-linecap="round" 
							stroke-linejoin="round"
							/>
						</svg>
					</div>
					<div className="ywhs_requirement_progress_bar">
						<div className="ywhs_requirement_notice">
							<span dangerouslySetInnerHTML={{__html: __( "Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉", 'yay-wholesale' )}} />
						</div>
						<div className="ywhs_r_base_bar">
							<div className="ywhs_r_value_bar"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
