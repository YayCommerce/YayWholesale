import { expect, test } from '../../fixtures/fixtures';

const productData = {
	virtual: {
		name: `Virtual product ${ Date.now() }`,
		regularPrice: '50.00',
		sku: `virt-${ Date.now() }`,
		shortDescription: 'Virtual product short description',
		description: 'Virtual product longer description',
	},
	'non virtual': {
		name: `Simple product ${ Date.now() }`,
		regularPrice: '100.05',
		sku: `simp-${ Date.now() }`,
		shortDescription: 'Simple product short description',
		description: 'Simple product HTML description.',
		shipping: { weight: '2', length: '20', width: '10', height: '30' },
	},
};

for ( const productType of Object.keys( productData ) ) {
	const data = productData[ productType as keyof typeof productData ];

	test( `can create a ${ productType } product`, async ( { page, product } ) => {
		await test.step( 'navigate to add new product', async () => {
			await page.goto( './wp-admin/post-new.php?post_type=product' );
		} );

		await test.step( 'fill in product name and description', async () => {
			await page.getByLabel( 'Product name' ).fill( data.name );
			await page.locator( '#content-html' ).click();
			await page.locator( '.wp-editor-area' ).first().fill( data.description );
			await page.locator( '#excerpt-html' ).click();
			await page.locator( '.wp-editor-area' ).nth( 1 ).fill( data.shortDescription );
		} );

		await test.step( 'set price and SKU', async () => {
			await page.getByLabel( 'Regular price ($)' ).fill( data.regularPrice );
			await page.getByRole( 'link' ).filter( { hasText: 'Inventory' } ).click();
			await page.getByLabel( 'SKU', { exact: true } ).fill( data.sku );
		} );

		if ( 'shipping' in data && data.shipping ) {
			await test.step( 'fill in shipping details', async () => {
				await page.getByRole( 'link', { name: 'Shipping' } ).click();
				await page.locator( '#_weight' ).fill( data.shipping!.weight );
				await page.getByPlaceholder( 'Length', { exact: true } ).fill( data.shipping!.length );
				await page.getByPlaceholder( 'Width' ).fill( data.shipping!.width );
				await page.getByPlaceholder( 'Height' ).fill( data.shipping!.height );
			} );
		}

		if ( productType === 'virtual' ) {
			await test.step( 'mark as virtual', async () => {
				await page.getByRole( 'checkbox', { name: 'Virtual' } ).check();
				await expect( page.getByRole( 'checkbox', { name: 'Virtual' } ) ).toBeChecked();
			} );
		}

		await test.step( 'publish the product', async () => {
			await page.getByRole( 'button', { name: 'Publish', exact: true } ).click();
			await expect(
				page.locator( 'div.notice-success > p' ).filter( { hasText: 'Product published.' } )
			).toBeVisible();
			product.id = page.url().match( /(?<=post=)\d+/ )?.[ 0 ];
			expect( product.id ).toBeTruthy();
		} );

		await test.step( 'verify product on the frontend', async () => {
			const permalink = await page.locator( '#sample-permalink a' ).innerText();
			await page.goto( permalink );
			await expect( page.getByRole( 'heading', { name: data.name } ) ).toBeVisible();
			await expect( page.getByText( data.regularPrice ).first() ).toBeVisible();
			await expect( page.getByText( data.shortDescription ).first() ).toBeVisible();
		} );

		await test.step( 'shopper can add the product to cart', async () => {
			await page.context().clearCookies();
			await page.reload();
			await page.getByRole( 'button', { name: 'Add to cart' } ).click();
			await page.getByRole( 'link', { name: 'View cart' } ).click();
			await expect( page.getByText( data.name ) ).toBeVisible();
		} );
	} );
}
