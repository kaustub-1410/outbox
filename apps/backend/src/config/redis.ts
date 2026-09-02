import Redis from 'ioredis';
import { env } from './env';
import { RedisMemoryServer } from 'redis-memory-server';

export const redisConnectionOptions = {
  host: env.REDIS_HOST || '127.0.0.1',
  port: Number(env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
};

let serverInstance: RedisMemoryServer | null = null;
export let redisClient: Redis;

export async function initRedis() {
  if (!serverInstance) {
    try {
      serverInstance = new RedisMemoryServer({
        instance: {
          port: Number(env.REDIS_PORT || 6379),
        },
      });
      await serverInstance.getHost();
      console.log(`[Redis] Started local in-memory Redis server on port ${env.REDIS_PORT || 6379}`);
    } catch (e: any) {
      console.log(`[Redis] Using external/existing Redis server on port ${env.REDIS_PORT || 6379}`);
    }
  }

  if (!redisClient) {
    redisClient = new Redis(redisConnectionOptions);
    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
    redisClient.on('error', () => {
      // Silent catch
    });
  }
}
