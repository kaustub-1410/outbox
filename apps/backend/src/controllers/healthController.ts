import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { redisClient } from '../config/redis';
import { esClient } from '../config/elasticsearch';

export class HealthController {
  static async check(req: Request, res: Response): Promise<void> {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        postgres: 'unknown',
        redis: 'unknown',
        elasticsearch: 'unknown',
      },
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      health.services.postgres = 'healthy';
    } catch (e: any) {
      health.services.postgres = `unhealthy: ${e.message}`;
      health.status = 'degraded';
    }

    try {
      await redisClient.ping();
      health.services.redis = 'healthy';
    } catch (e: any) {
      health.services.redis = `unhealthy: ${e.message}`;
      health.status = 'degraded';
    }

    try {
      await esClient.ping();
      health.services.elasticsearch = 'healthy';
    } catch (e: any) {
      health.services.elasticsearch = `degraded: ${e.message}`;
    }

    const statusCode = health.status === 'ok' ? 200 : 200; // Return 200 with service state
    res.status(statusCode).json(health);
  }
}
