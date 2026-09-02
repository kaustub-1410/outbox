import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AuthService } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (user) {
          req.user = user;
          return next();
        }
      } catch (jwtErr) {
        // Token invalid or expired, fallback to default user
      }
    }

    // Default demo user for smooth session handling
    req.user = await AuthService.getOrCreateDefaultUser();
    next();
  } catch (error: any) {
    req.user = {
      id: 'demo-user-123',
      name: 'Alex Johnson',
      email: 'alex.johnson@reachinbox.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    next();
  }
};
