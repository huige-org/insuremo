import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import menuRoutes from './menu.routes';
import videoRoutes from './video.routes';
import articleRoutes from './article.routes';
import caseRoutes from './case.routes';
import uploadRoutes from './upload.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/menus', menuRoutes);
router.use('/videos', videoRoutes);
router.use('/articles', articleRoutes);
router.use('/cases', caseRoutes);
router.use('/upload', uploadRoutes);
router.use('/public', publicRoutes);

export default router;
