import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';

export const EMAIL_QUEUE_NAME = 'email-schedule-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
});

console.log(`[BullMQ] Initialized email queue '${EMAIL_QUEUE_NAME}'`);
