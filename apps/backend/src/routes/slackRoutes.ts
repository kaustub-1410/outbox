import { Router } from 'express';
import { SlackController } from '../controllers/slackController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.get('/connect', authenticateJwt, SlackController.connect);
router.get('/callback', SlackController.callback);
router.get('/status', authenticateJwt, SlackController.getStatus);

export default router;
