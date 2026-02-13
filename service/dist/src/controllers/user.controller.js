"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRoles = exports.assignRoles = exports.removeRole = exports.assignRole = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const validator_1 = require("../utils/validator");
const createUserSchema = zod_1.z.object({
    email: validator_1.emailSchema,
    password: validator_1.passwordSchema,
    full_name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    avatar_url: zod_1.z.string().url().optional(),
    roleIds: zod_1.z.array(validator_1.uuidSchema).optional(),
});
const updateUserSchema = zod_1.z.object({
    email: validator_1.emailSchema.optional(),
    full_name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    avatar_url: zod_1.z.string().url().optional(),
    status: zod_1.z.enum(["active", "inactive", "banned"]).optional(),
    roleIds: zod_1.z.array(validator_1.uuidSchema).optional(),
});
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive", "banned"]).optional(),
});
const userIdSchema = zod_1.z.object({
    id: validator_1.uuidSchema,
});
const assignRoleSchema = zod_1.z.object({
    roleIds: zod_1.z.array(validator_1.uuidSchema),
});
const assignSingleRoleSchema = zod_1.z.object({
    roleId: validator_1.uuidSchema,
});
exports.getUsers = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, "Invalid query parameters");
        return;
    }
    const { users, meta } = await user_service_1.userService.findAll(result.data);
    (0, response_1.successResponse)(res, users, 200, meta);
});
exports.getUserById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = userIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const user = await user_service_1.userService.findById(result.data.id);
    (0, response_1.successResponse)(res, user);
});
exports.createUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    const user = await user_service_1.userService.create(result.data);
    (0, response_1.createdResponse)(res, user);
});
exports.updateUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    const user = await user_service_1.userService.update(paramsResult.data.id, bodyResult.data);
    (0, response_1.successResponse)(res, user);
});
exports.deleteUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = userIdSchema.safeParse(req.params);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    await user_service_1.userService.delete(result.data.id);
    (0, response_1.noContentResponse)(res);
});
exports.assignRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const bodyResult = assignSingleRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    await user_service_1.userService.assignRole(paramsResult.data.id, bodyResult.data.roleId);
    (0, response_1.successResponse)(res, { message: "Role assigned successfully" });
});
exports.removeRole = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const bodyResult = assignSingleRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    await user_service_1.userService.removeRole(paramsResult.data.id, bodyResult.data.roleId);
    (0, response_1.successResponse)(res, { message: "Role removed successfully" });
});
exports.assignRoles = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const bodyResult = assignRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    await user_service_1.userService.replaceRoles(paramsResult.data.id, bodyResult.data.roleIds);
    (0, response_1.successResponse)(res, { message: "Roles assigned successfully" });
});
exports.removeRoles = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid user ID");
        return;
    }
    const bodyResult = assignRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
        (0, response_1.badRequestResponse)(res, "Invalid request body");
        return;
    }
    // Remove specified roles (not all roles)
    for (const roleId of bodyResult.data.roleIds) {
        await user_service_1.userService.removeRole(paramsResult.data.id, roleId);
    }
    (0, response_1.successResponse)(res, { message: "Roles removed successfully" });
});
