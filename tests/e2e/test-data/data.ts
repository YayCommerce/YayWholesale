const { ADMIN_USER, ADMIN_PASSWORD, ADMIN_USER_EMAIL } = process.env;

export const admin = {
	username: ADMIN_USER ?? 'admin',
	password: ADMIN_PASSWORD ?? '1',
	email: ADMIN_USER_EMAIL ?? 'admin@example.com',
};
