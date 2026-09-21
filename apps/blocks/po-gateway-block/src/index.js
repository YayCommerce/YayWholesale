import { __ } from '@wordpress/i18n';
import { PAYMENT_METHOD_NAME, settings, Content, Label } from './render';

const { registerPaymentMethod } = window.wc.wcBlocksRegistry;

registerPaymentMethod( {
	name: PAYMENT_METHOD_NAME,
	label: <Label />,
	content: <Content />,
	edit: <Content />,
	ariaLabel: settings.title || __( 'Purchase Order (PO)', 'yay-wholesale-b2b' ),
	canMakePayment: () => true,
	supports: {
		features: settings.supports || [ 'products' ],
	},
} );
