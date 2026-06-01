import { test as setup } from '@playwright/test';
import fs from 'fs';

import { admin } from '../test-data/data';
import {
	ADMIN_STATE_MULTI_PATH,
	ADMIN_STATE_SINGLE_PATH,
	STORAGE_DIR_PATH,
} from '../playwright.config';

setup( 'authenticate admin', async ( { request }, testInfo ) => {
	if ( ! fs.existsSync( STORAGE_DIR_PATH ) ) {
		fs.mkdirSync( STORAGE_DIR_PATH, { recursive: true } );
	}

	await request.post( './wp-login.php', {
		form: {
			log: admin.username,
			pwd: admin.password,
		},
	} );

	const statePath = testInfo.project.name.includes( 'multisite' )
		? ADMIN_STATE_MULTI_PATH
		: ADMIN_STATE_SINGLE_PATH;

	await request.storageState( { path: statePath } );
} );
