import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma';
import { SearchService } from './searchService';
import { EmailJobStatus } from '@reachinbox/shared-types';

export class EmailService {
  private static etherealTransporter: nodemailer.Transporter | null = null;
  private static testAccount: nodemailer.TestAccount | null = null;

  private static async getTransporter(sender: {
    etherealHost?: string | null;
    etherealPort?: number | null;
    etherealUser?: string | null;
    etherealPassword?: string | null;
  }): Promise<nodemailer.Transporter> {
    if (sender.etherealUser && sender.etherealPassword) {
      return nodemailer.createTransport({
        host: sender.etherealHost || 'smtp.ethereal.email',
        port: sender.etherealPort || 587,
        secure: false,
        auth: {
          user: sender.etherealUser,
          pass: sender.etherealPassword,
        },
      });
    }

    if (!this.etherealTransporter) {
      this.testAccount = await nodemailer.createTestAccount();
      console.log('[EmailService] Created temporary Ethereal account:', this.testAccount.user);

      this.etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });
    }

    return this.etherealTransporter;
  }

  static async sendEmailJob(jobId: string): Promise<{ success: boolean; previewUrl?: string }> {
    const job = await prisma.emailJob.findUnique({
      where: { id: jobId },
      include: {
        lead: true,
        sender: true,
        campaign: true,
      },
    });

    if (!job) {
      throw new Error(`EmailJob ${jobId} not found in database.`);
    }

    // IDEMPOTENCY REQUIREMENT:
    // Before sending, check EmailJob status. If already SENT, skip!
    if (job.status === EmailJobStatus.SENT) {
      console.log(`[EmailService] Idempotency guard: EmailJob ${jobId} is already SENT. Skipping send.`);
      return { success: true, previewUrl: job.previewUrl || undefined };
    }

    const transporter = await this.getTransporter(job.sender);

    const mailOptions = {
      from: `"${job.sender.senderName}" <${job.sender.senderEmail}>`,
      to: job.lead.email,
      subject: job.subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>${job.subject}</h2>
          <div>${job.body.replace(/\n/g, '<br/>')}</div>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;"/>
          <p style="font-size: 12px; color: #888;">Sent via ReachInbox Scheduler</p>
        </div>
      `,
    };

    console.log(`[EmailService] Dispatching email job ${job.id} to ${job.lead.email}...`);
    const info = await transporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info) || `https://ethereal.email/message/${info.messageId}`;
    console.log(`[EmailService] Email sent successfully! Preview URL: ${previewUrl}`);

    const updatedJob = await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: EmailJobStatus.SENT,
        sentAt: new Date(),
        previewUrl,
      },
      include: { lead: true, sender: true },
    });

    // Sync state with Elasticsearch
    await SearchService.indexEmailJob({
      id: updatedJob.id,
      campaignId: updatedJob.campaignId,
      leadId: updatedJob.leadId,
      recipient: updatedJob.lead.email,
      subject: updatedJob.subject,
      body: updatedJob.body,
      status: EmailJobStatus.SENT,
      sender: updatedJob.sender.senderEmail,
      scheduledAt: updatedJob.scheduledAt,
      sentAt: updatedJob.sentAt,
      createdAt: updatedJob.createdAt,
    });

    return { success: true, previewUrl: previewUrl as string };
  }
}
