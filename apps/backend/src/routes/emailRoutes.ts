import { Router } from 'express';
import { EmailController } from '../controllers/emailController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.get('/scheduled', authenticateJwt, EmailController.getScheduledEmails);
router.get('/sent', authenticateJwt, EmailController.getSentEmails);
router.get('/metrics', authenticateJwt, EmailController.getMetrics);

export default router;
