import { useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export const PAYMENT_METHOD_NAME = 'ywhs_po_gateway';

const { getSetting } = window.wc.wcSettings;

export const settings = getSetting( `${ PAYMENT_METHOD_NAME }_data`, {} );

export const Content = ( props ) => {
	const { eventRegistration, emitResponse } = props;
	const { onPaymentSetup } = eventRegistration;

	const [ poNumber, setPoNumber ] = useState( '' );
	const [ file, setFile ] = useState( null );
	const [ fileError, setFileError ] = useState( '' );

	// Latest values are read through refs (kept in sync by the input handlers
	// below) so the payment-setup callback always sees current input without
	// needing to re-subscribe on every keystroke.
	const poNumberRef = useRef( poNumber );
	const fileRef = useRef( file );
	const subscribedRef = useRef( false );

	// Register the callback once, during the first render, instead of in a
	// useEffect — onPaymentSetup only needs to be called a single time per
	// mount and this avoids an extra render pass.
	if ( ! subscribedRef.current ) {
		subscribedRef.current = true;

		onPaymentSetup( async () => {
			const currentPoNumber = poNumberRef.current;
			const currentFile = fileRef.current;

			if ( '' === currentPoNumber.trim() ) {
				return {
					type: emitResponse.responseTypes.ERROR,
					message: __( 'Please enter your PO number.', 'yay-wholesale-b2b' ),
				};
			}

			const paymentData = { ywhs_po_number: currentPoNumber };

			if ( settings.requireAttachment ) {
				if ( ! currentFile ) {
					return {
						type: emitResponse.responseTypes.ERROR,
						message: __( 'Please attach your PO document.', 'yay-wholesale-b2b' ),
					};
				}

				try {
					const body = new window.FormData();
					body.append( 'file', currentFile );

					const response = await window.fetch( settings.uploadUrl, {
						method: 'POST',
						headers: { 'X-WP-Nonce': settings.restNonce },
						credentials: 'same-origin',
						body,
					} );

					const result = await response.json();

					if ( ! response.ok ) {
						throw new Error( result.message || __( 'Attachment upload failed.', 'yay-wholesale-b2b' ) );
					}

					paymentData.ywhs_po_attachment_ref = result.path;
					paymentData.ywhs_po_attachment_name = result.filename;
				} catch ( error ) {
					return {
						type: emitResponse.responseTypes.ERROR,
						message: error.message,
					};
				}
			}

			return {
				type: emitResponse.responseTypes.SUCCESS,
				meta: { paymentMethodData: paymentData },
			};
		} );
	}

	const onPoNumberChange = ( event ) => {
		poNumberRef.current = event.target.value;
		setPoNumber( event.target.value );
	};

	const onFileChange = ( event ) => {
		const selected = event.target.files && event.target.files[ 0 ] ? event.target.files[ 0 ] : null;

		if ( selected && selected.size > 5 * 1024 * 1024 ) {
			fileRef.current = null;
			setFile( null );
			setFileError( __( 'Attachment must be smaller than 5MB.', 'yay-wholesale-b2b' ) );
			return;
		}

		fileRef.current = selected;
		setFileError( '' );
		setFile( selected );
	};

	return (
		<div className="ywhs-po-gateway-fields">
			{ settings.description && <p>{ settings.description }</p> }
			<p className="form-row form-row-wide ywhs-po-gateway-field">
				<label htmlFor="ywhs_po_number">
					{ __( 'PO Number', 'yay-wholesale-b2b' ) } <span className="required">*</span>
				</label>
				<input
					type="text"
					id="ywhs_po_number"
					value={ poNumber }
					autoComplete="off"
					onChange={ onPoNumberChange }
				/>
			</p>
			{ settings.requireAttachment && (
				<p className="form-row form-row-wide ywhs-po-gateway-field">
					<label htmlFor="ywhs_po_attachment">
						{ __( 'PO Attachment', 'yay-wholesale-b2b' ) } <span className="required">*</span>
					</label>
					<input
						type="file"
						id="ywhs_po_attachment"
						accept=".pdf,.jpg,.jpeg,.png"
						onChange={ onFileChange }
					/>
					<small>{ fileError || __( 'PDF, JPG or PNG. Max 5MB.', 'yay-wholesale-b2b' ) }</small>
				</p>
			) }
		</div>
	);
};

export const Label = () => (
	<span className="ywhs-po-gateway-label">
		{ settings.title || __( 'Purchase Order (PO)', 'yay-wholesale-b2b' ) }
	</span>
);
