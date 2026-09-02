import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { prisma } from '../config/prisma';
import { EmailJobStatus } from '@reachinbox/shared-types';
import { AuthService } from '../services/authService';

export class EmailController {
  static async getScheduledEmails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const [total, items] = await Promise.all([
        prisma.emailJob.count({
          where: {
            campaign: { userId: currentUser.id },
            status: { in: [EmailJobStatus.SCHEDULED, EmailJobStatus.RATE_LIMITED] },
          },
        }),
        prisma.emailJob.findMany({
          where: {
            campaign: { userId: currentUser.id },
            status: { in: [EmailJobStatus.SCHEDULED, EmailJobStatus.RATE_LIMITED] },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { scheduledAt: 'asc' },
          include: {
            lead: true,
            sender: true,
            campaign: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          page,
          limit,
          items,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSentEmails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const [total, items] = await Promise.all([
        prisma.emailJob.count({
          where: {
            campaign: { userId: currentUser.id },
            status: EmailJobStatus.SENT,
          },
        }),
        prisma.emailJob.findMany({
          where: {
            campaign: { userId: currentUser.id },
            status: EmailJobStatus.SENT,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { sentAt: 'desc' },
          include: {
            lead: true,
            sender: true,
            campaign: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          total,
          page,
          limit,
          items,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());

      const [scheduledCount, sentCount, failedCount, rateLimitEventsCount, recentJobs] = await Promise.all([
        prisma.emailJob.count({
          where: { campaign: { userId: currentUser.id }, status: EmailJobStatus.SCHEDULED },
        }),
        prisma.emailJob.count({
          where: { campaign: { userId: currentUser.id }, status: EmailJobStatus.SENT },
        }),
        prisma.emailJob.count({
          where: { campaign: { userId: currentUser.id }, status: EmailJobStatus.FAILED },
        }),
        prisma.emailJob.count({
          where: { campaign: { userId: currentUser.id }, status: EmailJobStatus.RATE_LIMITED },
        }),
        prisma.emailJob.findMany({
          where: { campaign: { userId: currentUser.id } },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { lead: true, sender: true },
        }),
      ]);

      const recentActivity = recentJobs.map((job) => ({
        id: job.id,
        type: job.status,
        message: `Email to ${job.lead.email} - Subject: "${job.subject}"`,
        timestamp: (job.sentAt || job.scheduledAt || job.createdAt).toISOString(),
      }));

      res.json({
        success: true,
        data: {
          scheduledCount,
          sentCount,
          failedCount,
          rateLimitEventsCount,
          recentActivity,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
