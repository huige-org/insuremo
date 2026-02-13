import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/video.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getVideos);
router.get('/:id', authenticate, getVideoById);
router.post('/', authenticate, createVideo);
router.put('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);

export default router;
