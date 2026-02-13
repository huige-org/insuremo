"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menu_controller_1 = require("../controllers/menu.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const router = (0, express_1.Router)();
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
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'superadmin', 'test'), rate_limit_middleware_1.rateLimiter, menu_controller_1.getMenus);
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
router.get('/tree', auth_middleware_1.authenticate, menu_controller_1.getMenuTree);
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
router.get('/by-role', auth_middleware_1.authenticate, menu_controller_1.getMenusByRole);
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
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'superadmin', 'test'), menu_controller_1.createMenu);
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
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'superadmin', 'test'), menu_controller_1.getMenuById);
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
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'superadmin', 'test'), menu_controller_1.updateMenu);
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
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'superadmin', 'test'), menu_controller_1.deleteMenu);
exports.default = router;
