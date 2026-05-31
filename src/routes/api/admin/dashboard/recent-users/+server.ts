import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticateAdmin } from '$lib/server/admin-auth';

export const GET: RequestHandler = async (event) => {
	try {
		await authenticateAdmin(event);

		const limitParam = event.url.searchParams.get('limit');
		const limit = Math.min(parseInt(limitParam ?? '20', 10), 100);

		// Get the most recently active users based on their latest expense
		const latestExpenses = await prisma.expense.findMany({
			distinct: ['userId'],
			orderBy: { transactionDate: 'desc' },
			take: limit,
			select: {
				transactionDate: true,
				userId: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						createdAt: true
					}
				}
			}
		});

		// For each user, count total expenses and total spent
		const rows = await Promise.all(
			latestExpenses.map(async (e) => {
				const agg = await prisma.expense.aggregate({
					where: { userId: e.userId },
					_count: { id: true },
					_sum: { amount: true }
				});

				return {
					userId: e.userId,
					name: e.user.name ?? e.user.email ?? 'Unknown',
					email: e.user.email ?? '—',
					lastActivity: e.transactionDate.toISOString().split('T')[0],
					totalExpenses: agg._count.id,
					totalSpent: parseFloat(Number(agg._sum.amount ?? 0).toFixed(2)),
					memberSince: e.user.createdAt.toISOString().split('T')[0]
				};
			})
		);

		return json({ users: rows });
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
