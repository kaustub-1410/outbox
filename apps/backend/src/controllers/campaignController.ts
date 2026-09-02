import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { CampaignService } from '../services/campaignService';
import { AuthService } from '../services/authService';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  subject: z.string().min(1, 'Email subject is required'),
  body: z.string().min(1, 'Email body is required'),
  startTime: z.string().or(z.date()),
  delayBetweenEmails: z.number().min(0).default(2),
  hourlyLimit: z.number().min(1).default(200),
  senderId: z.string().optional(),
  leads: z.array(z.string()).min(1, 'At least one lead email is required'),
});

export class CampaignController {
  static async createCampaign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const validatedInput = createCampaignSchema.parse(req.body);

      const result = await CampaignService.createCampaign(currentUser.id, {
        ...validatedInput,
        startTime: new Date(validatedInput.startTime).toISOString(),
      });

      res.status(201).json({
        success: true,
        data: result,
        message: `Campaign scheduled successfully with ${result.totalLeads} lead(s).`,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0].message });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const campaigns = await CampaignService.getUserCampaigns(currentUser.id);
      res.json({ success: true, data: campaigns });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCampaignById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const { id } = req.params;
      const campaign = await CampaignService.getCampaignById(id, currentUser.id);

      if (!campaign) {
        res.status(404).json({ success: false, error: 'Campaign not found' });
        return;
      }

      res.json({ success: true, data: campaign });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async uploadLeads(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fileContent } = req.body;
      if (!fileContent || typeof fileContent !== 'string') {
        res.status(400).json({ success: false, error: 'File content text is required' });
        return;
      }

      // Split lines, parse email addresses
      const lines = fileContent.split(/\r?\n/);
      const extractedEmails: string[] = [];

      for (const line of lines) {
        // Support CSV comma separation or simple plain text list
        const parts = line.split(/[,;\t]/);
        for (const part of parts) {
          const trimmed = part.trim().toLowerCase();
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            extractedEmails.push(trimmed);
          }
        }
      }

      const uniqueEmails = Array.from(new Set(extractedEmails));

      res.json({
        success: true,
        data: {
          parsedCount: extractedEmails.length,
          uniqueCount: uniqueEmails.length,
          leads: uniqueEmails,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
