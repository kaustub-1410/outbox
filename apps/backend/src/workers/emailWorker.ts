import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import { EMAIL_QUEUE_NAME, emailQueue } from './emailQueue';
import { EmailService } from '../services/emailService';
import { RateLimitService } from '../services/rateLimitService';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { EmailJobStatus } from '@reachinbox/shared-types';

export interface EmailJobPayload {
  emailJobId: string;
  campaignId: string;
  senderId: string;
  userId: string;
  senderEmail: string;
  hourlyLimit: number;
}

export const emailWorker = new Worker<EmailJobPayload>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobPayload>) => {
    const { emailJobId, senderId, senderEmail, hourlyLimit, userId, campaignId } = job.data;

    console.log(`[BullMQ Worker] Processing job ${job.id} for EmailJob ${emailJobId}...`);

    const dbJob = await prisma.emailJob.findUnique({
      where: { id: emailJobId },
      include: { lead: true, sender: true },
    });

    if (!dbJob) {
      console.warn(`[BullMQ Worker] Job ${emailJobId} missing in database. Abandoning.`);
      return { status: 'MISSING' };
    }

    // IDEMPOTENCY GUARD:
    // If job is already SENT in Postgres, skip send immediately.
    if (dbJob.status === EmailJobStatus.SENT) {
      console.log(`[BullMQ Worker] Idempotency check passed: Job ${emailJobId} already SENT. Skipping.`);
      return { status: 'ALREADY_SENT' };
    }

    // Count remaining scheduled emails for this campaign to include in Slack alert
    const remainingCount = await prisma.emailJob.count({
      where: { campaignId, status: EmailJobStatus.SCHEDULED },
    });

    // DISTRIBUTED RATE LIMITER CHECK
    const rateLimitCheck = await RateLimitService.checkAndIncrementRateLimit(
      senderId,
      senderEmail,
      hourlyLimit || env.MAX_EMAILS_PER_HOUR_PER_SENDER,
      userId,
      remainingCount
    );

    if (!rateLimitCheck.allowed) {
      const delayMs = rateLimitCheck.resetInMs || 3600000;
      const nextScheduledDate = new Date(Date.now() + delayMs);

      console.warn(
        `[BullMQ Worker] Rate limit reached for sender ${senderEmail}. Rescheduling job ${emailJobId} with delay ${Math.round(
          delayMs / 1000
        )}s to ${nextScheduledDate.toISOString()}`
      );

      // Update DB record status and new scheduledAt time
      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          status: EmailJobStatus.RATE_LIMITED,
          scheduledAt: nextScheduledDate,
        },
      });

      // DO NOT FAIL THE JOB. Reschedule safely in BullMQ queue.
      const newBullJob = await emailQueue.add(
        'send-email',
        job.data,
        { delay: delayMs }
      );

      if (newBullJob?.id) {
        await prisma.emailJob.update({
          where: { id: emailJobId },
          data: { bullJobId: newBullJob.id },
        });
      }

      return {
        status: 'RESCHEDULED_RATE_LIMIT',
        rescheduledFor: nextScheduledDate.toISOString(),
        delayMs,
      };
    }

    // EXECUTE SEND
    try {
      const result = await EmailService.sendEmailJob(emailJobId);
      return { status: 'SENT', previewUrl: result.previewUrl };
    } catch (error: any) {
      console.error(`[BullMQ Worker] Failed to send email job ${emailJobId}:`, error.message);

      const newRetryCount = dbJob.retryCount + 1;
      const finalStatus = newRetryCount >= 3 ? EmailJobStatus.FAILED : EmailJobStatus.SCHEDULED;

      await prisma.emailJob.update({
        where: { id: emailJobId },
        data: {
          retryCount: newRetryCount,
          status: finalStatus,
        },
      });

      throw error; // Let BullMQ handle automatic exponential retry up to 3 times
    }
  },
  {
    connection: redisConnectionOptions,
    concurrency: env.WORKER_CONCURRENCY,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`[BullMQ Worker] Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[BullMQ Worker] Job ${job?.id} failed with error:`, err.message);
});
