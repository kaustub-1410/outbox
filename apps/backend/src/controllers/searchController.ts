import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';

export class SearchController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await SearchService.searchEmails(q, status, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
