import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const url = event.url;

		// Extract pagination query parameters
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

		// Extract filters
		const search = url.searchParams.get('search') || '';
		const categoryId = url.searchParams.get('category_id');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		// Extract sorting parameters
		const sortField = url.searchParams.get('sortField') || 'transactionDate';
		const sortDirection = url.searchParams.get('sortDirection') || 'desc';

		// Map API field names to DB field names
		const dbSortField = sortField === 'transaction_date' ? 'transactionDate' : sortField;

		// Build Prisma where clause
		const whereClause: any = {
			userId: payload.userId
		};

		if (search) {
			whereClause.description = {
				contains: search,
				mode: 'insensitive'
			};
		}

		if (categoryId) {
			whereClause.categoryId = parseInt(categoryId, 10);
		}

		if (startDate || endDate) {
			whereClause.transactionDate = {};
			if (startDate) {
				// Use T12:00:00Z (noon UTC) to avoid day-shift issues with @db.Date + timezone offsets
				whereClause.transactionDate.gte = new Date(`${startDate}T12:00:00.000Z`);
			}
			if (endDate) {
				whereClause.transactionDate.lte = new Date(`${endDate}T12:00:00.000Z`);
			}
		}

		// Query count, sum, and data concurrently
		const [totalItems, aggregateResult, dbExpenses] = await Promise.all([
			prisma.expense.count({ where: whereClause }),
			prisma.expense.aggregate({
				where: whereClause,
				_sum: {
					amount: true
				}
			}),
			prisma.expense.findMany({
				where: whereClause,
				skip: (page - 1) * pageSize,
				take: pageSize,
				orderBy: {
					[dbSortField]: sortDirection
				}
			})
		]);

		const totalPages = Math.ceil(totalItems / pageSize);
		const totalAmount = Number(aggregateResult._sum.amount || 0);

		// Map to API structure
		const mapped = dbExpenses.map(e => ({
			id: e.id,
			description: e.description,
			category_id: e.categoryId,
			amount: Number(e.amount),
			transaction_date: e.transactionDate.toISOString().split('T')[0],
			created_at: e.createdAt.toISOString()
		}));

		return json({
			data: mapped,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				pageSize
			},
			totalAmount
		});
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const { description, category_id, amount, transaction_date } = await event.request.json();

		if (!description || isNaN(amount) || !transaction_date) {
			return json({ error: 'Missing required expense fields' }, { status: 400 });
		}

		// Perform database transaction for expense and potential prefix update
		const result = await prisma.$transaction(async (tx) => {
			const expense = await tx.expense.create({
				data: {
					description,
					amount: parseFloat(amount),
					// Use T12:00:00Z (noon UTC) to avoid day-shift issues with @db.Date + timezone
					transactionDate: new Date(`${transaction_date}T12:00:00.000Z`),
					userId: payload.userId,
					categoryId: category_id ? parseInt(category_id, 10) : null
				}
			});

			// Extract matching prefix like [Prefix] and increment its usage count if found
			const prefixRegex = /^(\[[^\]]+\])/;
			const match = description.match(prefixRegex);
			if (match) {
				const foundPrefixText = match[1];

				// Find and upsert prefix to increment usage count
				await tx.itemPrefix.upsert({
					where: {
						uq_user_prefix: {
							userId: payload.userId,
							prefixText: foundPrefixText
						}
					},
					update: {
						usageCount: { increment: 1 }
					},
					create: {
						prefixText: foundPrefixText,
						usageCount: 1,
						userId: payload.userId
					}
				});
			}

			return expense;
		});

		return json(
			{
				id: result.id,
				description: result.description,
				category_id: result.categoryId,
				amount: Number(result.amount),
				transaction_date: result.transactionDate.toISOString().split('T')[0],
				created_at: result.createdAt.toISOString()
			},
			{ status: 201 }
		);
	} catch (err: any) {
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
