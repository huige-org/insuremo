import { Router } from 'express';
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} from '../controllers/case.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getCases);
router.get('/:id', authenticate, getCaseById);
router.post('/', authenticate, createCase);
router.put('/:id', authenticate, updateCase);
router.delete('/:id', authenticate, deleteCase);

export default router;
