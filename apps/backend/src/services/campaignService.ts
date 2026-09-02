import { prisma } from '../config/prisma';
import { emailQueue } from '../workers/emailQueue';
import { SearchService } from './searchService';
import { CreateCampaignInput, EmailJobStatus, CampaignStatus } from '@reachinbox/shared-types';

export class CampaignService {
  static async createCampaign(userId: string, input: CreateCampaignInput) {
    // Lead Email Validation & Deduplication
    const rawLeads = input.leads || [];
    const validLeadsSet = new Set<string>();

    for (const rawEmail of rawLeads) {
      const trimmed = rawEmail.trim().toLowerCase();
      // Basic RFC email validation pattern
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        validLeadsSet.add(trimmed);
      }
    }

    const uniqueLeads = Array.from(validLeadsSet);

    if (uniqueLeads.length === 0) {
      throw new Error('At least one valid unique email lead must be provided.');
    }

    // Sender resolution: use provided senderId or default sender for user
    let senderId = input.senderId;
    if (!senderId) {
      const defaultSender = await prisma.sender.findFirst({
        where: { userId },
      });
      if (!defaultSender) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const createdSender = await prisma.sender.create({
          data: {
            userId,
            senderName: user?.name || 'Default Sender',
            senderEmail: user?.email || 'sender@reachinbox.ai',
          },
        });
        senderId = createdSender.id;
      } else {
        senderId = defaultSender.id;
      }
    }

    const sender = await prisma.sender.findUnique({ where: { id: senderId } });
    if (!sender) {
      throw new Error('Specified sender account not found.');
    }

    const startTime = new Date(input.startTime);
    const delayBetweenMs = Math.max(0, (input.delayBetweenEmails || 2) * 1000);
    const hourlyLimit = input.hourlyLimit || 200;

    // Create Campaign in PostgreSQL
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: input.name,
        subject: input.subject,
        body: input.body,
        startTime,
        delayBetweenEmails: input.delayBetweenEmails || 2,
        hourlyLimit,
        status: CampaignStatus.PROCESSING,
      },
    });

    // Bulk Create Leads
    const leadsData = uniqueLeads.map((email) => ({
      campaignId: campaign.id,
      email,
    }));

    await prisma.lead.createMany({
      data: leadsData,
    });

    const createdLeads = await prisma.lead.findMany({
      where: { campaignId: campaign.id },
    });

    const now = Date.now();
    const emailJobsToCreate: Array<{
      lead: (typeof createdLeads)[0];
      scheduledAt: Date;
      delayMs: number;
    }> = [];

    // Calculate incremental delayed job timestamps for each lead
    createdLeads.forEach((lead, index) => {
      const scheduledTimeMs = startTime.getTime() + index * delayBetweenMs;
      const delayMs = Math.max(0, scheduledTimeMs - now);
      const scheduledAt = new Date(scheduledTimeMs);

      emailJobsToCreate.push({
        lead,
        scheduledAt,
        delayMs,
      });
    });

    const createdJobs = [];

    // Create EmailJob records and BullMQ delayed jobs
    for (const item of emailJobsToCreate) {
      const emailJob = await prisma.emailJob.create({
        data: {
          campaignId: campaign.id,
          leadId: item.lead.id,
          senderId: sender.id,
          subject: campaign.subject,
          body: campaign.body,
          scheduledAt: item.scheduledAt,
          status: EmailJobStatus.SCHEDULED,
        },
      });

      // Add Delayed Job to BullMQ Queue
      const bullJob = await emailQueue.add(
        'send-email',
        {
          emailJobId: emailJob.id,
          campaignId: campaign.id,
          senderId: sender.id,
          userId,
          senderEmail: sender.senderEmail,
          hourlyLimit,
        },
        {
          delay: item.delayMs,
        }
      );

      // Store Bull Job ID in Postgres DB
      const updatedEmailJob = await prisma.emailJob.update({
        where: { id: emailJob.id },
        data: { bullJobId: bullJob.id },
      });

      // Index in Elasticsearch
      await SearchService.indexEmailJob({
        id: updatedEmailJob.id,
        campaignId: campaign.id,
        leadId: item.lead.id,
        recipient: item.lead.email,
        subject: campaign.subject,
        body: campaign.body,
        status: EmailJobStatus.SCHEDULED,
        sender: sender.senderEmail,
        scheduledAt: item.scheduledAt,
        createdAt: updatedEmailJob.createdAt,
      });

      createdJobs.push(updatedEmailJob);
    }

    return {
      campaign,
      totalLeads: uniqueLeads.length,
      scheduledJobsCount: createdJobs.length,
      firstScheduledAt: createdJobs[0]?.scheduledAt,
      lastScheduledAt: createdJobs[createdJobs.length - 1]?.scheduledAt,
    };
  }

  static async getUserCampaigns(userId: string) {
    return prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            leads: true,
            emailJobs: true,
          },
        },
      },
    });
  }

  static async getCampaignById(campaignId: string, userId: string) {
    return prisma.campaign.findFirst({
      where: { id: campaignId, userId },
      include: {
        leads: true,
        emailJobs: {
          include: {
            lead: true,
            sender: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });
  }
}
