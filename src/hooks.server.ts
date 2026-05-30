import { handle as authHandle } from './auth';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// Routes that require authentication
const PROTECTED_ROUTES = ['/(app)'];

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();
	const pathname = event.url.pathname;

	// Redirect unauthenticated users away from protected routes
	const isProtected =
		!pathname.startsWith('/login') &&
		!pathname.startsWith('/auth') &&
		!pathname.startsWith('/api/auth');

	if (isProtected && !session?.user) {
		redirect(303, '/login');
	}

	// Redirect authenticated users away from login page
	if (pathname === '/login' && session?.user) {
		redirect(303, '/');
	}

	return resolve(event);
};

export const handle = sequence(authHandle, authorizationHandle);
