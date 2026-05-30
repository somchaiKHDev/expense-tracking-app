import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const DELETE: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const id = parseInt(event.params.id || '', 10);

		if (isNaN(id)) {
			return json({ error: 'Invalid prefix ID' }, { status: 400 });
		}

		await prisma.itemPrefix.delete({
			where: { id, userId: payload.userId }
		});

		return json({ success: true, message: 'Prefix deleted successfully' });
	} catch (err: any) {
		if (err.code === 'P2025') {
			return json({ error: 'Prefix not found' }, { status: 404 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
