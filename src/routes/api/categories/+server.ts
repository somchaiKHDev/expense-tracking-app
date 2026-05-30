import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const userCategories = await prisma.category.findMany({
			where: { userId: payload.userId },
			select: { id: true, name: true, monthlyLimit: true }
		});

		return json(userCategories);
	} catch (err: any) {
		return json({ error: err.message || 'Unauthorized' }, { status: err.status || 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const { name, monthlyLimit } = await event.request.json();

		if (!name) {
			return json({ error: 'Category name is required' }, { status: 400 });
		}

		// Create category in Prisma database
		const newCategory = await prisma.category.create({
			data: {
				name,
				monthlyLimit: monthlyLimit ? Number(monthlyLimit) : null,
				userId: payload.userId
			},
			select: { id: true, name: true, monthlyLimit: true }
		});

		return json(newCategory, { status: 201 });
	} catch (err: any) {
		console.error('Error creating category:', err);
		// Handle Prisma unique constraint error
		if (err.code === 'P2002') {
			return json({ error: 'Category name already exists' }, { status: 409 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
