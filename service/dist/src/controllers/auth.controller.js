"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getCurrentUser = exports.logout = exports.refreshToken = exports.register = exports.login = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const menu_service_1 = require("../services/menu.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const validator_1 = require("../utils/validator");
const loginSchema = zod_1.z.object({
    email: validator_1.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
const registerSchema = zod_1.z.object({
    email: validator_1.emailSchema,
    password: validator_1.passwordSchema,
    full_name: zod_1.z.string().min(2, 'Full name must be at least 2 characters').optional(),
    phone: zod_1.z.string().optional(),
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: validator_1.passwordSchema,
});
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const authResponse = await auth_service_1.authService.login(result.data);
    (0, response_1.successResponse)(res, authResponse);
});
exports.register = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const authResponse = await auth_service_1.authService.register(result.data);
    (0, response_1.createdResponse)(res, authResponse);
});
exports.refreshToken = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = refreshTokenSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const tokens = await auth_service_1.authService.refreshToken(result.data.refreshToken);
    (0, response_1.successResponse)(res, { tokens });
});
exports.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (userId) {
        await auth_service_1.authService.logout(userId);
    }
    (0, response_1.successResponse)(res, { message: 'Logged out successfully' });
});
exports.getCurrentUser = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        (0, response_1.badRequestResponse)(res, 'User not authenticated');
        return;
    }
    const menus = await menu_service_1.menuService.findByUser(userId);
    (0, response_1.successResponse)(res, { user: req.user, menus });
});
exports.changePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        (0, response_1.badRequestResponse)(res, 'User not authenticated');
        return;
    }
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    await auth_service_1.authService.changePassword(userId, result.data.currentPassword, result.data.newPassword);
    (0, response_1.successResponse)(res, { message: 'Password changed successfully' });
});
