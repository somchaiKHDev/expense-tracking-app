import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const PUT: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const id = parseInt(event.params.id || '', 10);
		const body = await event.request.json();

		if (isNaN(id)) {
			return json({ error: 'Invalid expense ID' }, { status: 400 });
		}

		// Update fields if provided in body
		const dataToUpdate: any = {};
		if (body.description !== undefined) dataToUpdate.description = body.description;
		if (body.amount !== undefined) dataToUpdate.amount = parseFloat(body.amount);
		if (body.category_id !== undefined) {
			dataToUpdate.categoryId = body.category_id ? parseInt(body.category_id, 10) : null;
		}
		if (body.transaction_date !== undefined) {
			// Use T12:00:00Z (noon UTC) to avoid day-shift issues with @db.Date + timezone
			dataToUpdate.transactionDate = new Date(`${body.transaction_date}T12:00:00.000Z`);
		}

		const updated = await prisma.expense.update({
			where: { id, userId: payload.userId },
			data: dataToUpdate
		});

		return json({
			id: updated.id,
			description: updated.description,
			category_id: updated.categoryId,
			amount: Number(updated.amount),
			transaction_date: updated.transactionDate.toISOString().split('T')[0],
			created_at: updated.createdAt.toISOString()
		});
	} catch (err: any) {
		if (err.code === 'P2025') {
			return json({ error: 'Expense not found' }, { status: 404 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const id = parseInt(event.params.id || '', 10);

		if (isNaN(id)) {
			return json({ error: 'Invalid expense ID' }, { status: 400 });
		}

		await prisma.expense.delete({
			where: { id, userId: payload.userId }
		});

		return json({ success: true, message: 'Expense deleted successfully' });
	} catch (err: any) {
		if (err.code === 'P2025') {
			return json({ error: 'Expense not found' }, { status: 404 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
