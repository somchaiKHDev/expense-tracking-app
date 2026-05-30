import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const PUT: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const id = parseInt(event.params.id || '', 10);
		const { name, monthlyLimit } = await event.request.json();

		if (isNaN(id) || !name) {
			return json({ error: 'Invalid ID or category name' }, { status: 400 });
		}

		// Update category in database
		const updatedCategory = await prisma.category.update({
			where: { id, userId: payload.userId },
			data: {
				name,
				monthlyLimit: monthlyLimit !== undefined ? (monthlyLimit ? Number(monthlyLimit) : null) : undefined
			},
			select: { id: true, name: true, monthlyLimit: true }
		});

		return json(updatedCategory);
	} catch (err: any) {
		if (err.code === 'P2002') {
			return json({ error: 'Category name already exists' }, { status: 409 });
		}
		if (err.code === 'P2025') {
			return json({ error: 'Category not found' }, { status: 404 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const id = parseInt(event.params.id || '', 10);

		if (isNaN(id)) {
			return json({ error: 'Invalid category ID' }, { status: 400 });
		}

		await prisma.category.delete({
			where: { id, userId: payload.userId }
		});

		return json({ success: true, message: 'Category deleted successfully' });
	} catch (err: any) {
		if (err.code === 'P2025') {
			return json({ error: 'Category not found' }, { status: 404 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
