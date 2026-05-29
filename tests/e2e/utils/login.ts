import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

export async function logIn(
	page: Page,
	username: string,
	password: string,
	assertSuccess = true
) {
	await page.getByLabel( 'Username or Email Address' ).click( { delay: 100 } );
	await page.getByLabel( 'Username or Email Address' ).fill( username );
	await page.getByRole( 'textbox', { name: 'Password' } ).click( { delay: 100 } );
	await page.getByRole( 'textbox', { name: 'Password' } ).fill( password );
	await page.getByRole( 'button', { name: 'Log In' } ).click();

	if ( assertSuccess ) {
		await expect( page ).toHaveTitle( /Dashboard/ );
	}
}
