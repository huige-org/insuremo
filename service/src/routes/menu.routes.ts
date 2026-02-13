import { Router } from 'express';
import {
  getMenus,
  getMenuTree,
  getMenusByRole,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management endpoints
 */

/**
 * @swagger
 * /api/v1/menus:
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [directory, menu, button]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: List of menus
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize('admin', 'superadmin', 'test'), rateLimiter, getMenus);

/**
 * @swagger
 * /api/v1/menus/tree:
 *   get:
 *     summary: Get menu tree
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu tree structure
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/tree', authenticate, getMenuTree);

/**
 * @swagger
 * /api/v1/menus/by-role:
 *   get:
 *     summary: Get menus by role
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menus for role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/by-role', authenticate, getMenusByRole);

/**
 * @swagger
 * /api/v1/menus:
 *   post:
 *     summary: Create new menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *             properties:
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [directory, menu, button]
 *               permission:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Menu created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Menu code already exists
 */
router.post('/', authenticate, authorize('admin', 'superadmin', 'test'), createMenu);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Menu not found
 */
router.get('/:id', authenticate, authorize('admin', 'superadmin', 'test'), getMenuById);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [directory, menu, button]
 *               permission:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Menu updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Menu not found
 */
router.put('/:id', authenticate, authorize('admin', 'superadmin', 'test'), updateMenu);

/**
 * @swagger
 * /api/v1/menus/{id}:
 *   delete:
 *     summary: Delete menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Menu deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Menu not found
 */
router.delete('/:id', authenticate, authorize('admin', 'superadmin', 'test'), deleteMenu);

export default router;
