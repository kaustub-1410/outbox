import { Router } from 'express';
import authRoutes from './authRoutes';
import campaignRoutes from './campaignRoutes';
import emailRoutes from './emailRoutes';
import slackRoutes from './slackRoutes';
import searchRoutes from './searchRoutes';
import healthRoutes from './healthRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/emails', emailRoutes);
apiRouter.use('/slack', slackRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/health', healthRoutes);

export default apiRouter;
