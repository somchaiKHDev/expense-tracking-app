import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// If user is already logged in, redirect to home
export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (session?.user) {
		redirect(303, '/');
	}
	return {};
};
