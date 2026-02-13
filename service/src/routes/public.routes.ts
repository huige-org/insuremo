import { Router } from 'express';
import { articleService } from '../services/article.service';
import { videoService } from '../services/video.service';
import { caseService } from '../services/case.service';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse } from '../utils/response';

const router = Router();

router.get('/articles', asyncHandler(async (_req, res) => {
  const list = await articleService.findAll({ page: 1, pageSize: 100, status: 'published' });
  successResponse(res, list.list);
}));

router.get('/videos', asyncHandler(async (_req, res) => {
  const list = await videoService.findAll({ page: 1, pageSize: 100, status: 'published' });
  successResponse(res, list.list);
}));

router.get('/cases', asyncHandler(async (_req, res) => {
  const list = await caseService.findAll({ page: 1, pageSize: 100, status: 'published' });
  successResponse(res, list.list);
}));

export default router;
