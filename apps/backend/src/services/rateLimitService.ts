import { redisClient } from '../config/redis';
import { env } from '../config/env';
import { SlackService } from './slackService';

export class RateLimitService {
  private static getHourKey(senderId: string): { key: string; nextHourResetInMs: number } {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours()).padStart(2, '0');

    const key = `rate_limit:${senderId}:${year}${month}${day}${hour}`;

    // Calculate ms remaining until next UTC hour
    const nextHour = new Date(now);
    nextHour.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
    const nextHourResetInMs = Math.max(1000, nextHour.getTime() - now.getTime());

    return { key, nextHourResetInMs };
  }

  static async checkAndIncrementRateLimit(
    senderId: string,
    senderEmail: string,
    hourlyLimit: number = env.MAX_EMAILS_PER_HOUR_PER_SENDER,
    userId: string,
    remainingCount: number = 1
  ): Promise<{ allowed: boolean; resetInMs?: number; currentCount: number }> {
    const { key, nextHourResetInMs } = this.getHourKey(senderId);

    // Atomic increment
    const currentCount = await redisClient.incr(key);

    // Set TTL of 2 hours on key creation
    if (currentCount === 1) {
      await redisClient.expire(key, 7200);
    }

    if (currentCount > hourlyLimit) {
      console.warn(
        `[RateLimitService] Sender ${senderEmail} (${senderId}) exceeded hourly limit (${currentCount}/${hourlyLimit}). Rescheduling job in ${Math.round(
          nextHourResetInMs / 1000
        )}s.`
      );

      // Only trigger Slack notification once when limit is first breached
      if (currentCount === hourlyLimit + 1) {
        await SlackService.sendRateLimitAlert(userId, senderEmail, remainingCount);
      }

      return {
        allowed: false,
        resetInMs: nextHourResetInMs,
        currentCount,
      };
    }

    return {
      allowed: true,
      currentCount,
    };
  }

  static async getRateLimitStats(senderId: string): Promise<{ currentCount: number }> {
    const { key } = this.getHourKey(senderId);
    const countStr = await redisClient.get(key);
    return { currentCount: countStr ? parseInt(countStr, 10) : 0 };
  }
}
