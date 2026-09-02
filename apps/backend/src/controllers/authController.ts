import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  static async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, avatar, googleId } = req.body;
      const targetEmail = email || `demo.user.${Date.now()}@reachinbox.ai`;
      const targetName = name || 'ReachInbox Demo User';
      const targetGoogleId = googleId || `google-uid-${Date.now()}`;

      const { user, token } = await AuthService.handleGoogleAuth({
        email: targetEmail,
        name: targetName,
        avatar,
        googleId: targetGoogleId,
      });

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const defaultUser = await AuthService.getOrCreateDefaultUser();
        const token = AuthService.generateToken(defaultUser.id);
        res.json({ success: true, data: { user: defaultUser, token } });
        return;
      }
      res.json({ success: true, data: { user: req.user } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('jwt');
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
