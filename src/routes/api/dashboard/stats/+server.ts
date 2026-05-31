import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const startDateParam = event.url.searchParams.get('startDate'); // YYYY-MM-DD
		const endDateParam = event.url.searchParams.get('endDate'); // YYYY-MM-DD

		if (!startDateParam || !/^\d{4}-\d{2}-\d{2}$/.test(startDateParam)) {
			return json({ error: 'Valid startDate parameter (YYYY-MM-DD) is required' }, { status: 400 });
		}
		if (!endDateParam || !/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)) {
			return json({ error: 'Valid endDate parameter (YYYY-MM-DD) is required' }, { status: 400 });
		}

		// Parse date range
		const startDate = new Date(`${startDateParam}T00:00:00.000Z`);
		const endDate = new Date(`${endDateParam}T23:59:59.999Z`);

		// Get all user expenses for the given month
		const userExpenses = await prisma.expense.findMany({
			where: {
				userId: payload.userId,
				transactionDate: {
					gte: startDate,
					lte: endDate
				}
			}
		});

		// Calculate total spent
		const totalSpent = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

		// Get user's categories
		const userCategories = await prisma.category.findMany({
			where: { userId: payload.userId }
		});

		// Group spent by category
		const categoryTotals: { [key: number]: number } = {};
		userCategories.forEach(c => {
			categoryTotals[c.id] = 0;
		});

		userExpenses.forEach((e) => {
			const catId = e.categoryId;
			if (catId !== null) {
				if (categoryTotals[catId] !== undefined) {
					categoryTotals[catId] += Number(e.amount);
				} else {
					categoryTotals[catId] = Number(e.amount);
				}
			}
		});

		const categoryDistribution = Object.keys(categoryTotals).map((catIdStr) => {
			const catId = parseInt(catIdStr, 10);
			const name = userCategories.find((c) => c.id === catId)?.name || 'อื่นๆ';
			const amount = categoryTotals[catId];
			const percentage = totalSpent > 0 ? parseFloat(((amount / totalSpent) * 100).toFixed(2)) : 0;
			return {
				category_id: catId,
				name,
				amount,
				percentage
			};
		}).filter(item => item.amount > 0);

		// Sort distribution by amount descending
		categoryDistribution.sort((a, b) => b.amount - a.amount);

		// Group by daily trend
		const dailyMap: { [date: string]: number } = {};
		userExpenses.forEach((e) => {
			const date = e.transactionDate.toISOString().split('T')[0];
			dailyMap[date] = (dailyMap[date] || 0) + Number(e.amount);
		});

		const dailyTrend = Object.keys(dailyMap).map((date) => ({
			date,
			amount: parseFloat(dailyMap[date].toFixed(2))
		}));

		// Sort daily trend by date ascending
		dailyTrend.sort((a, b) => a.date.localeCompare(b.date));

		return json({
			totalSpent: parseFloat(totalSpent.toFixed(2)),
			categoryDistribution,
			dailyTrend
		});
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
