import { expect as baseExpect, test as baseTest } from '@playwright/test';
import { createClient, WC_API_PATH, WP_API_PATH, WC_ADMIN_API_PATH } from '@woocommerce/e2e-utils-playwright';

import { admin } from '../test-data/data';

export { WC_API_PATH, WC_ADMIN_API_PATH, WP_API_PATH };

export const test = baseTest.extend< {
	restApi: ReturnType< typeof createClient >;
	product: { id?: string };
} >( {
	restApi: async ( { baseURL }, use ) => {
		await use(
			createClient( baseURL ?? '', {
				type: 'basic',
				username: admin.username,
				password: admin.password,
			} )
		);
	},

	product: async ( { restApi }, use ) => {
		const product: { id?: string } = {};
		await use( product );
		if ( product.id ) {
			await restApi.delete( `${ WC_API_PATH }/products/${ product.id }`, { force: true } );
		}
	},
} );

export const expect = baseExpect;
