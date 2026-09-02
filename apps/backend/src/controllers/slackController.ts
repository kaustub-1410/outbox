import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { SlackService } from '../services/slackService';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AuthService } from '../services/authService';

export class SlackController {
  static async connect(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const url = await SlackService.getAuthUrl(currentUser.id);
      res.redirect(url);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async callback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;
      const userId = (state as string) || req.user?.id || (await AuthService.getOrCreateDefaultUser()).id;

      if (code) {
        await SlackService.handleOAuthCallback(code as string, userId);
      }

      res.redirect(`${env.FRONTEND_URL}/settings?slack=connected`);
    } catch (error: any) {
      res.redirect(`${env.FRONTEND_URL}/settings?slack=error`);
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user || (await AuthService.getOrCreateDefaultUser());
      const connection = await prisma.slackConnection.findFirst({
        where: { userId: currentUser.id },
      });

      res.json({
        success: true,
        data: {
          isConnected: Boolean(connection),
          connection: connection
            ? {
                id: connection.id,
                workspaceId: connection.workspaceId,
                teamName: connection.teamName || 'Slack Workspace',
                createdAt: connection.createdAt,
              }
            : null,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
