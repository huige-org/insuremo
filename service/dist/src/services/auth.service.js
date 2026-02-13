"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const cache_service_1 = require("./cache.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const helpers_1 = require("../utils/helpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';
class AuthService {
    supabase = (0, database_1.getSupabaseClient)();
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        return {
            accessToken,
            refreshToken,
            expiresIn: 24 * 60 * 60, // 24 hours in seconds
        };
    }
    async login(dto) {
        const { data: user, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('email', dto.email)
            .single();
        if (error || !user) {
            throw new error_middleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        if (user.status === 'banned') {
            throw new error_middleware_1.AppError('Account has been banned', 403, 'ACCOUNT_BANNED');
        }
        // Auto-activate inactive users for development
        if (user.status === 'inactive') {
            await this.supabase
                .from('profiles')
                .update({ status: 'active', updated_at: new Date().toISOString() })
                .eq('id', user.id);
            user.status = 'active';
        }
        const isPasswordValid = await (0, helpers_1.comparePassword)(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new error_middleware_1.AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }
        // Update last login
        await this.supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
        // Get user roles
        const { data: userRoles } = await this.supabase
            .from('user_roles')
            .select('role:roles(code)')
            .eq('user_id', user.id);
        const roles = (userRoles || [])
            .map((ur) => ur.role?.code)
            .filter((code) => Boolean(code));
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            roles,
        });
        // Cache session
        await cache_service_1.cacheService.set(`session:${user.id}`, { tokens, roles }, 24 * 60 * 60);
        logger_1.logger.info(`User logged in: ${user.email}`);
        return {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                roles,
            },
            tokens,
        };
    }
    async register(dto) {
        // Check if email exists
        const { data: existingUser } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('email', dto.email)
            .single();
        if (existingUser) {
            throw new error_middleware_1.AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }
        const passwordHash = await (0, helpers_1.hashPassword)(dto.password);
        const userId = (0, helpers_1.generateId)();
        const { data: user, error } = await this.supabase
            .from('profiles')
            .insert({
            id: userId,
            email: dto.email,
            password_hash: passwordHash,
            full_name: dto.full_name || null,
            phone: dto.phone || null,
            status: 'active',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error || !user) {
            logger_1.logger.error('Registration error:', error);
            throw new error_middleware_1.AppError('Failed to create user', 500, 'REGISTRATION_FAILED');
        }
        // Assign default user role
        const { data: defaultRole } = await this.supabase
            .from('roles')
            .select('id')
            .eq('code', 'user')
            .single();
        if (defaultRole) {
            await this.supabase.from('user_roles').insert({
                user_id: userId,
                role_id: defaultRole.id,
            });
        }
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            roles: ['user'],
        });
        logger_1.logger.info(`User registered: ${user.email}`);
        return {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                roles: ['user'],
            },
            tokens,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            const { data: user } = await this.supabase
                .from('profiles')
                .select('id, email')
                .eq('id', decoded.userId)
                .single();
            if (!user) {
                throw new error_middleware_1.AppError('User not found', 401, 'USER_NOT_FOUND');
            }
            const { data: userRoles } = await this.supabase
                .from('user_roles')
                .select('role:roles(code)')
                .eq('user_id', user.id);
            const roles = (userRoles || [])
                .map((ur) => ur.role?.code)
                .filter((code) => Boolean(code));
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                roles,
            });
            await cache_service_1.cacheService.set(`session:${user.id}`, { tokens, roles }, 24 * 60 * 60);
            return tokens;
        }
        catch (error) {
            throw new error_middleware_1.AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
    }
    async logout(userId) {
        await cache_service_1.cacheService.delete(`session:${userId}`);
        logger_1.logger.info(`User logged out: ${userId}`);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const { data: user } = await this.supabase
            .from('profiles')
            .select('password_hash')
            .eq('id', userId)
            .single();
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        const isValid = await (0, helpers_1.comparePassword)(currentPassword, user.password_hash);
        if (!isValid) {
            throw new error_middleware_1.AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
        }
        const newPasswordHash = await (0, helpers_1.hashPassword)(newPassword);
        const { error } = await this.supabase
            .from('profiles')
            .update({
            password_hash: newPasswordHash,
            updated_at: new Date().toISOString(),
        })
            .eq('id', userId);
        if (error) {
            throw new error_middleware_1.AppError('Failed to change password', 500, 'PASSWORD_CHANGE_FAILED');
        }
        // Clear all sessions
        await cache_service_1.cacheService.delete(`session:${userId}`);
        logger_1.logger.info(`Password changed for user: ${userId}`);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
