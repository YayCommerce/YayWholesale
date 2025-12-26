/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

/* eslint-disable no-console */
console.log( 'Hello World! (from create-block-requirement-block block)' );
/* eslint-enable no-console */
import { store, getConfig } from '@wordpress/interactivity';
import { __, sprintf } from '@wordpress/i18n';

// Lock key for accessing WooCommerce private store
const WC_STORE_LOCK =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

// Get WooCommerce cart store (uses private lock)
const { state: wcState } = store( 'woocommerce', {}, { lock: WC_STORE_LOCK } );

// const config = getConfig("ywhs_wholesale_requirement");
// const wholesaleRole = config?.wholesale ?? null;
// const currencyData = config?.currencyData ?? {
//     currency: '',
//     symbol: '$',
//     positon: '',
//     thousand_sep: '.',
//     decimal_sep: ',',
//     num_decimals: 2
// };

// export function parseWPCurrency(price) {
//     if (typeof price === 'string') {
//       price = parseFloat(price);
//     }
  
//     const { symbol, position, thousand_sep, decimal_sep, num_decimals } = currencyData;
  
//     const formattedPrice = price
//       .toFixed(num_decimals)
//       .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep)
//       .replace(/(\d+)\.(\d{2})$/, `$1${decimal_sep}$2`);
  
//     switch (position) {
//       case 'left':
//         return `${symbol}${formattedPrice}`;
//       case 'right':
//         return `${formattedPrice}${symbol}`;
//       case 'left_space':
//         return `${symbol} ${formattedPrice}`;
//       case 'right_space':
//         return `${formattedPrice} ${symbol}`;
//     }
// }

store('ywhs_wholesale_requirement', {
    state: {

    },
    callbacks: {
        init() {
            console.log("Hello from req block");
        },
        watchCartUpdates() {
            console.log(wcState);
            console.log("Watching req block");
        }
    }
})
