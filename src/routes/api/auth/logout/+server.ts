import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	// Delete the session cookie by setting its maxAge to 0
	event.cookies.delete('session_token', {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict'
	});

	return json({ success: true, message: 'Logged out successfully' });
};
