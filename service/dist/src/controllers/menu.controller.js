"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenu = exports.updateMenu = exports.createMenu = exports.getMenuById = exports.getMenusByRole = exports.getMenuTree = exports.getMenus = void 0;
const zod_1 = require("zod");
const menu_service_1 = require("../services/menu.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const validator_1 = require("../utils/validator");
const createMenuSchema = zod_1.z.object({
    parent_id: validator_1.uuidSchema.optional().nullable(),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z.string().min(2, 'Code must be at least 2 characters'),
    path: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    sort_order: zod_1.z.coerce.number().optional(),
    type: zod_1.z.enum(['directory', 'menu', 'button']),
    permission: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const updateMenuSchema = zod_1.z.object({
    parent_id: validator_1.uuidSchema.optional().nullable(),
    name: zod_1.z.string().min(2).optional(),
    path: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    sort_order: zod_1.z.coerce.number().optional(),
    type: zod_1.z.enum(['directory', 'menu', 'button']).optional(),
    permission: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    type: zod_1.z.enum(['directory', 'menu', 'button']).optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const menuIdSchema = zod_1.z.object({
    id: validator_1.uuidSchema,
});
const roleIdSchema = zod_1.z.object({
    roleId: validator_1.uuidSchema,
});
exports.getMenus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid query parameters');
        return;
    }
    const { menus, meta } = await menu_service_1.menuService.findAll(result.data);
    (0, response_1.successResponse)(res, menus, 200, meta);
});
exports.getMenuTree = (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const tree = await menu_service_1.menuService.findTree();
    (0, response_1.successResponse)(res, tree);
});
exports.getMenusByRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = roleIdSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const menus = await menu_service_1.menuService.findByRole(result.data.roleId);
    (0, response_1.successResponse)(res, menus);
});
exports.getMenuById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = menuIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid menu ID');
        return;
    }
    const menu = await menu_service_1.menuService.findById(result.data.id);
    (0, response_1.successResponse)(res, menu);
});
exports.createMenu = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createMenuSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const menu = await menu_service_1.menuService.create(result.data);
    (0, response_1.createdResponse)(res, menu);
});
exports.updateMenu = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = menuIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid menu ID');
        return;
    }
    const bodyResult = updateMenuSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const menu = await menu_service_1.menuService.update(paramsResult.data.id, bodyResult.data);
    (0, response_1.successResponse)(res, menu);
});
exports.deleteMenu = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = menuIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid menu ID');
        return;
    }
    await menu_service_1.menuService.delete(result.data.id);
    (0, response_1.noContentResponse)(res);
});
