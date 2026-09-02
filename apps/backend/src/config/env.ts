import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/reachinbox?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  ELASTICSEARCH_URL: z.string().default('http://localhost:9200'),
  JWT_SECRET: z.string().default('reachinbox_super_secret_jwt_key_2026'),
  GOOGLE_CLIENT_ID: z.string().default('mock-google-client-id'),
  GOOGLE_CLIENT_SECRET: z.string().default('mock-google-client-secret'),
  SLACK_CLIENT_ID: z.string().default('mock-slack-client-id'),
  SLACK_CLIENT_SECRET: z.string().default('mock-slack-client-secret'),
  WORKER_CONCURRENCY: z.string().transform((val) => parseInt(val, 10)).default('10'),
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.string().transform((val) => parseInt(val, 10)).default('200'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
});

export const env = envSchema.parse(process.env);
