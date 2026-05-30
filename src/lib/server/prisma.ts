import { PrismaClient } from '@prisma/client';

// Shared singleton Prisma Client instance
export const prisma = new PrismaClient();
