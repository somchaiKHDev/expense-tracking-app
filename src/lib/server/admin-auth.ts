import { error, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

/**
 * Authenticate and verify admin access.
 * Throws 401 if not logged in, 403 if not an admin.
 */
export async function authenticateAdmin(event: RequestEvent): Promise<{ userId: string; email: string }> {
	const payload = await authenticate(event);

	const user = await prisma.user.findUnique({
		where: { id: String(payload.userId) },
		select: { isAdmin: true }
	});

	if (!user?.isAdmin) {
		throw error(403, 'Access denied: Admin only');
	}

	return { userId: String(payload.userId), email: payload.email };
}
