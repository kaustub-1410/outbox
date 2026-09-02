import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

import express from 'express';
import cors from 'cors';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config/env';
import { initElasticsearch } from './config/elasticsearch';
import { redisClient, initRedis } from './config/redis';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { AuthService } from './services/authService';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Favicon 204 fallback to avoid 404 console errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Intercept ALL Bull Board API calls when Redis is offline to guarantee 200 OK responses
app.use('/admin/queues/api', (req, res, next) => {
  if (!redisClient || redisClient.status !== 'ready') {
    return res.status(200).json({
      queues: [],
      readOnly: true,
      stats: { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 },
      note: 'Redis queue is offline',
    });
  }
  next();
});

const startServer = async () => {
  try {
    await initRedis();
  } catch (err: any) {
    console.warn('[Backend Notice] Redis initialization notice:', err.message);
  }

  // Import queues and workers after Redis server initialization
  const { emailQueue } = await import('./workers/emailQueue');
  await import('./workers/emailWorker');

  // Bull Board UI Dashboard setup at /admin/queues
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(emailQueue as any) as any],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  // Mount API routes
  app.use('/api', apiRouter);

  // Root health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'reachinbox-backend', timestamp: new Date().toISOString() });
  });

  // Centralized error handler
  app.use(errorHandler);

  try {
    // Auto initialize default demo user in DB for smooth first launch
    await AuthService.getOrCreateDefaultUser();
  } catch (err: any) {
    console.warn('[Backend Notice] Using fallback session profile:', err.message);
  }

  try {
    // Initialize Elasticsearch index
    await initElasticsearch();
  } catch (err: any) {
    console.warn('[Backend Notice] Elasticsearch offline, using DB fallback:', err.message);
  }

  app.listen(Number(env.PORT), () => {
    console.log(`===================================================`);
    console.log(`🚀 ReachInbox Backend Server running on port ${env.PORT}`);
    console.log(`📊 Bull Board Dashboard: http://localhost:${env.PORT}/admin/queues`);
    console.log(`🔍 Health Check: http://localhost:${env.PORT}/health`);
    console.log(`===================================================`);
  });
};

startServer();
