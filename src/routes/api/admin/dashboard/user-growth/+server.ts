import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticateAdmin } from '$lib/server/admin-auth';

export const GET: RequestHandler = async (event) => {
	try {
		await authenticateAdmin(event);

		const now = new Date();

		// Build 12 monthly buckets (current month + 11 previous)
		const months: { year: number; month: number; label: string }[] = [];
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const abbr = d.toLocaleString('en-US', { month: 'short' });
			months.push({ year: d.getFullYear(), month: d.getMonth(), label: abbr });
		}

		// Count cumulative users up to end of each month
		const dataPoints = await Promise.all(
			months.map(async ({ year, month, label }) => {
				const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
				const count = await prisma.user.count({
					where: { createdAt: { lte: endOfMonth } }
				});
				return { label, count };
			})
		);

		return json({
			labels: dataPoints.map((d) => d.label),
			data: dataPoints.map((d) => d.count)
		});
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
