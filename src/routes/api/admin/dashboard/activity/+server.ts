import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticateAdmin } from '$lib/server/admin-auth';

export const GET: RequestHandler = async (event) => {
	try {
		await authenticateAdmin(event);

		const now = new Date();
		const thirtyDaysAgo = new Date(now);
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// Get all expenses in the last 30 days with the user relation
		const expenses = await prisma.expense.findMany({
			where: {
				transactionDate: { gte: thirtyDaysAgo }
			},
			select: {
				transactionDate: true,
				userId: true
			}
		});

		// Build a map of date -> unique active user set
		const dateUserMap: Record<string, Set<string>> = {};

		// Fill every day in the range with empty sets
		for (let i = 0; i < 30; i++) {
			const d = new Date(thirtyDaysAgo);
			d.setDate(d.getDate() + i);
			const dateStr = d.toISOString().split('T')[0];
			dateUserMap[dateStr] = new Set();
		}

		// Populate with expense data
		for (const expense of expenses) {
			const dateStr = expense.transactionDate.toISOString().split('T')[0];
			if (dateUserMap[dateStr]) {
				dateUserMap[dateStr].add(expense.userId);
			}
		}

		const sorted = Object.keys(dateUserMap).sort();
		const labels = sorted.map((d) => {
			const [, , day] = d.split('-');
			const date = new Date(d);
			return `${parseInt(day)}/${date.getMonth() + 1}`;
		});
		const data = sorted.map((d) => dateUserMap[d].size);

		return json({ labels, data });
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
