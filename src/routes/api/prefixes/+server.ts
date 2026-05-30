import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const userPrefixes = await prisma.itemPrefix.findMany({
			where: { userId: payload.userId },
			select: { id: true, prefixText: true, usageCount: true },
			orderBy: { usageCount: 'desc' }
		});

		// Format output keys to match REST expectation
		const formatted = userPrefixes.map(p => ({
			id: p.id,
			prefix_text: p.prefixText,
			usage_count: p.usageCount
		}));

		return json(formatted);
	} catch (err: any) {
		return json({ error: err.message || 'Unauthorized' }, { status: err.status || 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const payload = await authenticate(event);
		const { prefix_text } = await event.request.json();

		if (!prefix_text) {
			return json({ error: 'Prefix text is required' }, { status: 400 });
		}

		// Ensure prefix is enclosed in brackets or format it
		let formattedPrefix = prefix_text;
		if (!formattedPrefix.startsWith('[') || !formattedPrefix.endsWith(']')) {
			formattedPrefix = `[${formattedPrefix.replace(/[\[\]]/g, '')}]`;
		}

		// Create prefix in database
		const newPrefix = await prisma.itemPrefix.create({
			data: {
				prefixText: formattedPrefix,
				userId: payload.userId
			},
			select: { id: true, prefixText: true, usageCount: true }
		});

		return json({
			id: newPrefix.id,
			prefix_text: newPrefix.prefixText,
			usage_count: newPrefix.usageCount
		}, { status: 201 });
	} catch (err: any) {
		if (err.code === 'P2002') {
			return json({ error: 'Prefix text already exists' }, { status: 409 });
		}
		return json({ error: err.message || 'Internal Server Error' }, { status: err.status || 500 });
	}
};
