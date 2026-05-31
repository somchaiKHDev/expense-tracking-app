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

		const prevThirtyStart = new Date(thirtyDaysAgo);
		prevThirtyStart.setDate(prevThirtyStart.getDate() - 30);

		// Total users
		const totalUsers = await prisma.user.count();

		// Users created in last 30 days (active = registered)
		const activeUsers = await prisma.user.count({
			where: { createdAt: { gte: thirtyDaysAgo } }
		});

		// Users created in prev 30 days for comparison
		const prevActiveUsers = await prisma.user.count({
			where: {
				createdAt: { gte: prevThirtyStart, lt: thirtyDaysAgo }
			}
		});

		// Total expenses count (used as "sessions")
		const totalSessions = await prisma.expense.count();

		// Total expenses in last 30 days
		const recentSessions = await prisma.expense.count({
			where: { transactionDate: { gte: thirtyDaysAgo } }
		});

		// Total expense amount (used as "revenue")
		const revenueAgg = await prisma.expense.aggregate({
			_sum: { amount: true }
		});

		// Revenue in last 30 days
		const recentRevenueAgg = await prisma.expense.aggregate({
			_sum: { amount: true },
			where: { transactionDate: { gte: thirtyDaysAgo } }
		});

		// Revenue in prev 30 days
		const prevRevenueAgg = await prisma.expense.aggregate({
			_sum: { amount: true },
			where: {
				transactionDate: { gte: prevThirtyStart, lt: thirtyDaysAgo }
			}
		});

		const totalRevenue = Number(revenueAgg._sum.amount ?? 0);
		const recentRevenue = Number(recentRevenueAgg._sum.amount ?? 0);
		const prevRevenue = Number(prevRevenueAgg._sum.amount ?? 0);

		// Helper: calculate percentage change
		function pctChange(current: number, previous: number): number {
			if (previous === 0) return current > 0 ? 100 : 0;
			return parseFloat((((current - previous) / previous) * 100).toFixed(1));
		}

		// New users in last 30 vs prev 30
		const newUsersThisPeriod = await prisma.user.count({
			where: { createdAt: { gte: thirtyDaysAgo } }
		});

		const newUsersPrevPeriod = await prisma.user.count({
			where: {
				createdAt: { gte: prevThirtyStart, lt: thirtyDaysAgo }
			}
		});

		return json({
			totalUsers,
			totalUsersChange: pctChange(newUsersThisPeriod, newUsersPrevPeriod),
			activeUsers,
			activeUsersChange: pctChange(activeUsers, prevActiveUsers),
			totalSessions,
			totalSessionsChange: pctChange(recentSessions, totalSessions - recentSessions),
			totalRevenue: parseFloat(totalRevenue.toFixed(2)),
			totalRevenueChange: pctChange(recentRevenue, prevRevenue)
		});
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
