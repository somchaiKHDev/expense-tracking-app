import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { comparePassword, generateToken } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password } = await event.request.json();

		if (!email || !password) {
			return json({ success: false, message: 'Email and password are required' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});
		if (!user) {
			return json({ success: false, message: 'Invalid email or password' }, { status: 401 });
		}

		const isValid = await comparePassword(password, user.passwordHash);
		if (!isValid) {
			return json({ success: false, message: 'Invalid email or password' }, { status: 401 });
		}

		const token = generateToken({ userId: user.id, email: user.email });

		// Set secure HttpOnly cookie
		event.cookies.set('session_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				display_name: user.displayName
			}
		});
	} catch (err: any) {
		return json({ success: false, message: err.message || 'Internal Server Error' }, { status: 500 });
	}
};
