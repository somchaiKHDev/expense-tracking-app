import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(302, '/login');
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true, name: true, email: true, image: true }
	});

	if (!user?.isAdmin) {
		throw redirect(302, '/');
	}

	return {
		adminUser: {
			name: user.name ?? user.email ?? 'Admin',
			email: user.email ?? '',
			image: user.image ?? null
		}
	};
};
