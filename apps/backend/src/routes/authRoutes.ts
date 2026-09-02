import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.post('/google', AuthController.googleAuth);
router.get('/me', authenticateJwt, AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
