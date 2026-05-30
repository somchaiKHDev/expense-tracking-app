import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { hashPassword, generateToken } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password, display_name } = await event.request.json();

		if (!email || !password) {
			return json({ success: false, message: 'Email and password are required' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});
		if (existingUser) {
			return json({ success: false, message: 'Email already registered' }, { status: 400 });
		}

		const passwordHash = await hashPassword(password);
		const newUser = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				passwordHash,
				displayName: display_name || email.split('@')[0]
			}
		});

		const token = generateToken({ userId: newUser.id, email: newUser.email });

		// Set secure HttpOnly cookie
		event.cookies.set('session_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json(
			{
				success: true,
				message: 'User registered successfully',
				user: {
					id: newUser.id,
					email: newUser.email,
					display_name: newUser.displayName
				}
			},
			{ status: 201 }
		);
	} catch (err: any) {
		return json({ success: false, message: err.message || 'Internal Server Error' }, { status: 500 });
	}
};
