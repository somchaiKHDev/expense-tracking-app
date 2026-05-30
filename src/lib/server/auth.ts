import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { error, type RequestEvent } from '@sveltejs/kit';
import { users } from './mockDb';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-for-local-dev-12345';

export interface TokenPayload {
	userId: number;
	email: string;
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload {
	try {
		return jwt.verify(token, JWT_SECRET) as TokenPayload;
	} catch {
		throw error(401, 'Invalid or expired token');
	}
}

// Parse request cookies and return user ID
export async function authenticate(event: RequestEvent): Promise<TokenPayload> {
	// Try Auth.js session first
	const session = await event.locals.auth();
	if (session?.user?.id) {
		return { userId: session.user.id as any, email: session.user.email ?? '' };
	}

	const token = event.cookies.get('session_token');
	if (!token) {
		throw error(401, 'Session token missing or expired');
	}
	const payload = verifyToken(token);
	// Ensure userId is string for Prisma compatibility
	return { ...payload, userId: String(payload.userId) as any };
}

// Hash password helper (mocked using bcrypt)
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

// Compare password helper (mocked using bcrypt)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
