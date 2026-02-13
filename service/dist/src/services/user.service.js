"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const cache_service_1 = require("./cache.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const helpers_1 = require("../utils/helpers");
class UserService {
    supabase = (0, database_1.getSupabaseClient)();
    cachePrefix = 'user';
    mapToResponse(user, roles = []) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            phone: user.phone,
            status: user.status,
            email_verified: user.email_verified,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
            roles,
        };
    }
    async findAll(params) {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        let query = this.supabase
            .from('profiles')
            .select('*', { count: 'exact' });
        if (params.search) {
            query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) {
            logger_1.logger.error('Find all users error:', error);
            throw new error_middleware_1.AppError('Failed to fetch users', 500, 'FETCH_USERS_FAILED');
        }
        const users = (data || []);
        // Fetch roles for all users
        const userIds = users.map((u) => u.id);
        const { data: userRoles } = await this.supabase
            .from('user_roles')
            .select('user_id, role:roles(code)')
            .in('user_id', userIds);
        const rolesMap = new Map();
        (userRoles || []).forEach((ur) => {
            if (!rolesMap.has(ur.user_id)) {
                rolesMap.set(ur.user_id, []);
            }
            if (ur.role?.code) {
                rolesMap.get(ur.user_id)?.push(ur.role.code);
            }
        });
        const usersWithRoles = users.map((user) => this.mapToResponse(user, rolesMap.get(user.id) || []));
        const total = count || 0;
        const totalPages = Math.ceil(total / pageSize);
        return {
            users: usersWithRoles,
            meta: {
                page,
                pageSize,
                total,
                totalPages,
            },
        };
    }
    async findById(id) {
        const cacheKey = cache_service_1.cacheService.generateKey(this.cachePrefix, id);
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const { data: user, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !user) {
            throw new error_middleware_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        const { data: userRoles } = await this.supabase
            .from('user_roles')
            .select('role:roles(code)')
            .eq('user_id', id);
        const roles = (userRoles || [])
            .map((ur) => ur.role?.code)
            .filter((code) => Boolean(code));
        const response = this.mapToResponse(user, roles);
        await cache_service_1.cacheService.set(cacheKey, response, 3600);
        return response;
    }
    async create(dto) {
        const { data: existing } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('email', dto.email)
            .single();
        if (existing) {
            throw new error_middleware_1.AppError('Email already exists', 409, 'EMAIL_EXISTS');
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
            avatar_url: dto.avatar_url || null,
            status: 'active',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error || !user) {
            logger_1.logger.error('Create user error:', error);
            throw new error_middleware_1.AppError('Failed to create user', 500, 'CREATE_USER_FAILED');
        }
        if (dto.roleIds && dto.roleIds.length > 0) {
            await this.assignRoles(userId, dto.roleIds);
        }
        logger_1.logger.info(`User created: ${user.email}`);
        return this.findById(userId);
    }
    async update(id, dto) {
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (dto.email)
            updateData.email = dto.email;
        if (dto.full_name !== undefined)
            updateData.full_name = dto.full_name;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.avatar_url !== undefined)
            updateData.avatar_url = dto.avatar_url;
        if (dto.status)
            updateData.status = dto.status;
        const { data: user, error } = await this.supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error || !user) {
            throw new error_middleware_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        if (dto.roleIds) {
            await this.replaceRoles(id, dto.roleIds);
        }
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        logger_1.logger.info(`User updated: ${user.email}`);
        return this.findById(id);
    }
    async replaceRoles(userId, roleIds) {
        await this.supabase.from('user_roles').delete().eq('user_id', userId);
        if (roleIds.length > 0) {
            await this.assignRoles(userId, roleIds);
        }
    }
    async assignRoles(userId, roleIds) {
        const roleMappings = roleIds.map(roleId => ({
            user_id: userId,
            role_id: roleId,
        }));
        const { error } = await this.supabase.from('user_roles').insert(roleMappings);
        if (error) {
            logger_1.logger.error('Assign roles error:', error);
            throw new error_middleware_1.AppError('Failed to assign roles', 500, 'ASSIGN_ROLES_FAILED');
        }
    }
    async delete(id) {
        const { error } = await this.supabase.from('profiles').delete().eq('id', id);
        if (error) {
            throw new error_middleware_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        logger_1.logger.info(`User deleted: ${id}`);
    }
    async assignRole(userId, roleId) {
        const { error } = await this.supabase.from('user_roles').insert({
            user_id: userId,
            role_id: roleId,
        });
        if (error) {
            if (error.code === '23505') {
                throw new error_middleware_1.AppError('Role already assigned', 409, 'ROLE_ALREADY_ASSIGNED');
            }
            throw new error_middleware_1.AppError('Failed to assign role', 500, 'ASSIGN_ROLE_FAILED');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, userId));
        logger_1.logger.info(`Role ${roleId} assigned to user ${userId}`);
    }
    async removeRole(userId, roleId) {
        const { error } = await this.supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role_id', roleId);
        if (error) {
            throw new error_middleware_1.AppError('Failed to remove role', 500, 'REMOVE_ROLE_FAILED');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, userId));
        logger_1.logger.info(`Role ${roleId} removed from user ${userId}`);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
