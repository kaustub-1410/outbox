import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('postgresql')) {
  process.env.DATABASE_URL = isServerless ? 'file:/tmp/dev.db' : 'file:./dev.db';
}

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
