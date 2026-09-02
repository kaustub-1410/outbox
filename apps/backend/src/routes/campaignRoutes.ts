import { Router } from 'express';
import { CampaignController } from '../controllers/campaignController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateJwt, CampaignController.createCampaign);
router.get('/', authenticateJwt, CampaignController.getCampaigns);
router.get('/:id', authenticateJwt, CampaignController.getCampaignById);
router.post('/upload', authenticateJwt, CampaignController.uploadLeads);

export default router;
