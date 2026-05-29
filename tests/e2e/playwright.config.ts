import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config( { path: path.join( __dirname, '.env' ) } );

const SINGLE_SITE_URL = process.env.SINGLE_SITE_URL ?? 'http://localhost:8889';
const MULTI_SITE_URL = process.env.MULTI_SITE_URL ?? 'http://localhost:8890';
const { CI } = process.env;

export const TESTS_ROOT_PATH = __dirname;
export const STORAGE_DIR_PATH = path.join( TESTS_ROOT_PATH, '.state' );
export const ADMIN_STATE_SINGLE_PATH = path.join( STORAGE_DIR_PATH, 'admin-single.json' );
export const ADMIN_STATE_MULTI_PATH = path.join( STORAGE_DIR_PATH, 'admin-multi.json' );

const sharedUse = {
	screenshot: { mode: 'only-on-failure' as const, fullPage: true },
	video: 'retain-on-failure' as const,
	trace: 'retain-on-first-failure' as const,
	actionTimeout: CI ? 20_000 : 10_000,
	navigationTimeout: CI ? 20_000 : 10_000,
	...devices[ 'Desktop Chrome' ],
};

export default defineConfig( {
	timeout: 120_000,
	expect: { timeout: CI ? 20_000 : 10_000 },
	outputDir: path.join( TESTS_ROOT_PATH, 'test-results' ),
	retries: CI ? 1 : 0,
	workers: 1,
	forbidOnly: !! CI,
	reporter: CI
		? [
				[ 'junit', { outputFile: 'test-results/results.xml' } ],
				[ 'list' ],
		  ]
		: [
				[ 'html', { outputFolder: 'playwright-report', open: 'on-failure' } ],
				[ 'list' ],
		  ],

	projects: [
		// ── Single-site (wp-env development, port 8888) ──────────────────────
		{
			name: 'setup_test_single',
			testMatch: '**/fixtures/auth.setup.ts',
			use: { ...sharedUse, baseURL: SINGLE_SITE_URL },
		},
		{
			name: 'test_single',
			testDir: path.join( TESTS_ROOT_PATH, 'tests' ),
			dependencies: [ 'setup_test_single' ],
			use: {
				...sharedUse,
				baseURL: SINGLE_SITE_URL,
				storageState: ADMIN_STATE_SINGLE_PATH,
			},
		},

		// ── Multisite (wp-env tests, port 8889) ──────────────────────────────
		{
			name: 'setup_test_multisite',
			testMatch: '**/fixtures/auth.setup.ts',
			use: { ...sharedUse, baseURL: MULTI_SITE_URL },
		},
		{
			name: 'test_multisite',
			testDir: path.join( TESTS_ROOT_PATH, 'tests' ),
			dependencies: [ 'setup_test_multisite' ],
			use: {
				...sharedUse,
				baseURL: MULTI_SITE_URL,
				storageState: ADMIN_STATE_MULTI_PATH,
			},
		},
	],
} );
