import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJwt, SearchController.search);

export default router;
