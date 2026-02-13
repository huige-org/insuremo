"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMenu = exports.assignMenu = exports.getMenusByRole = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const zod_1 = require("zod");
const role_service_1 = require("../services/role.service");
const menu_service_1 = require("../services/menu.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const validator_1 = require("../utils/validator");
const createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z.string().min(2, 'Code must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    is_system: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const updateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    search: zod_1.z.string().optional(),
});
const roleIdSchema = zod_1.z.object({
    id: validator_1.uuidSchema,
});
const assignMenuSchema = zod_1.z.object({
    menuIds: zod_1.z.array(validator_1.uuidSchema),
});
exports.getRoles = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid query parameters');
        return;
    }
    const { roles, meta } = await role_service_1.roleService.findAll(result.data);
    (0, response_1.successResponse)(res, roles, 200, meta);
});
exports.getRoleById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = roleIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const role = await role_service_1.roleService.findById(result.data.id);
    (0, response_1.successResponse)(res, role);
});
exports.createRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createRoleSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const role = await role_service_1.roleService.create(result.data);
    (0, response_1.createdResponse)(res, role);
});
exports.updateRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = roleIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const bodyResult = updateRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const role = await role_service_1.roleService.update(paramsResult.data.id, bodyResult.data);
    (0, response_1.successResponse)(res, role);
});
exports.deleteRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = roleIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    await role_service_1.roleService.delete(result.data.id);
    (0, response_1.noContentResponse)(res);
});
exports.getMenusByRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = roleIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const menus = await menu_service_1.menuService.findByRole(result.data.id);
    (0, response_1.successResponse)(res, menus);
});
exports.assignMenu = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = roleIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const bodyResult = assignMenuSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    await role_service_1.roleService.replaceMenus(paramsResult.data.id, bodyResult.data.menuIds);
    (0, response_1.successResponse)(res, { message: 'Menus assigned successfully' });
});
exports.removeMenu = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = roleIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid role ID');
        return;
    }
    const bodyResult = assignMenuSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    for (const menuId of bodyResult.data.menuIds) {
        await role_service_1.roleService.removeMenu(paramsResult.data.id, menuId);
    }
    (0, response_1.successResponse)(res, { message: 'Menus removed successfully' });
});
