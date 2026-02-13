"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = exports.RoleService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const cache_service_1 = require("./cache.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const helpers_1 = require("../utils/helpers");
class RoleService {
    supabase = (0, database_1.getSupabaseClient)();
    cachePrefix = 'role';
    mapToResponse(role, menuIds = [], userCount = 0) {
        return {
            id: role.id,
            name: role.name,
            code: role.code,
            description: role.description,
            is_system: role.is_system,
            status: role.status,
            created_at: role.created_at,
            updated_at: role.updated_at,
            menus: menuIds,
            user_count: userCount,
        };
    }
    async findAll(params) {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        let query = this.supabase.from('roles').select('*', { count: 'exact' });
        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) {
            logger_1.logger.error('Find all roles error:', error);
            throw new error_middleware_1.AppError('Failed to fetch roles', 500, 'FETCH_ROLES_FAILED');
        }
        const roles = (data || []);
        // Get user counts for each role
        const roleIds = roles.map((r) => r.id);
        const { data: roleUserCounts } = await this.supabase
            .from('user_roles')
            .select('role_id')
            .in('role_id', roleIds);
        const userCountMap = new Map();
        roleUserCounts?.forEach((ur) => {
            const current = userCountMap.get(ur.role_id) || 0;
            userCountMap.set(ur.role_id, current + 1);
        });
        const rolesWithCounts = roles.map((role) => this.mapToResponse(role, [], userCountMap.get(role.id) || 0));
        const total = count || 0;
        const totalPages = Math.ceil(total / pageSize);
        return {
            roles: rolesWithCounts,
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
        const { data: role, error } = await this.supabase
            .from('roles')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !role) {
            throw new error_middleware_1.AppError('Role not found', 404, 'ROLE_NOT_FOUND');
        }
        // Get associated menus
        const { data: roleMenus } = await this.supabase
            .from('role_menus')
            .select('menu_id')
            .eq('role_id', id);
        const menuIds = roleMenus?.map((rm) => rm.menu_id) || [];
        // Get user count
        const { count } = await this.supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', id);
        const response = this.mapToResponse(role, menuIds, count || 0);
        await cache_service_1.cacheService.set(cacheKey, response, 3600);
        return response;
    }
    async create(dto) {
        // Check code exists
        const { data: existing } = await this.supabase
            .from('roles')
            .select('id')
            .eq('code', dto.code)
            .single();
        if (existing) {
            throw new error_middleware_1.AppError('Role code already exists', 409, 'CODE_EXISTS');
        }
        const roleId = (0, helpers_1.generateId)();
        const { data: role, error } = await this.supabase
            .from('roles')
            .insert({
            id: roleId,
            name: dto.name,
            code: dto.code,
            description: dto.description || null,
            is_system: dto.is_system || false,
            status: dto.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error || !role) {
            logger_1.logger.error('Create role error:', error);
            throw new error_middleware_1.AppError('Failed to create role', 500, 'CREATE_ROLE_FAILED');
        }
        logger_1.logger.info(`Role created: ${role.name}`);
        return this.mapToResponse(role);
    }
    async update(id, dto) {
        const { data: existingRole } = await this.supabase
            .from('roles')
            .select('is_system')
            .eq('id', id)
            .single();
        if (existingRole?.is_system) {
            throw new error_middleware_1.AppError('Cannot modify system role', 403, 'SYSTEM_ROLE_PROTECTED');
        }
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (dto.name)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.status)
            updateData.status = dto.status;
        const { data: role, error } = await this.supabase
            .from('roles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error || !role) {
            throw new error_middleware_1.AppError('Role not found', 404, 'ROLE_NOT_FOUND');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        logger_1.logger.info(`Role updated: ${role.name}`);
        return this.findById(id);
    }
    async delete(id) {
        const { data: role } = await this.supabase
            .from('roles')
            .select('is_system')
            .eq('id', id)
            .single();
        if (role?.is_system) {
            throw new error_middleware_1.AppError('Cannot delete system role', 403, 'SYSTEM_ROLE_PROTECTED');
        }
        const { error } = await this.supabase.from('roles').delete().eq('id', id);
        if (error) {
            throw new error_middleware_1.AppError('Role not found', 404, 'ROLE_NOT_FOUND');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        logger_1.logger.info(`Role deleted: ${id}`);
    }
    async assignMenu(roleId, menuId) {
        const { error } = await this.supabase.from('role_menus').insert({
            role_id: roleId,
            menu_id: menuId,
        });
        if (error) {
            if (error.code === '23505') {
                throw new error_middleware_1.AppError('Menu already assigned', 409, 'MENU_ALREADY_ASSIGNED');
            }
            throw new error_middleware_1.AppError('Failed to assign menu', 500, 'ASSIGN_MENU_FAILED');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, roleId));
        logger_1.logger.info(`Menu ${menuId} assigned to role ${roleId}`);
    }
    async removeMenu(roleId, menuId) {
        const { error } = await this.supabase
            .from('role_menus')
            .delete()
            .eq('role_id', roleId)
            .eq('menu_id', menuId);
        if (error) {
            throw new error_middleware_1.AppError('Failed to remove menu', 500, 'REMOVE_MENU_FAILED');
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, roleId));
        logger_1.logger.info(`Menu ${menuId} removed from role ${roleId}`);
    }
    async replaceMenus(roleId, menuIds) {
        // Delete existing menus
        await this.supabase.from('role_menus').delete().eq('role_id', roleId);
        if (menuIds.length > 0) {
            // Insert new menu associations
            const inserts = menuIds.map((menuId) => ({
                role_id: roleId,
                menu_id: menuId,
            }));
            const { error } = await this.supabase.from('role_menus').insert(inserts);
            if (error) {
                logger_1.logger.error('Replace menus error:', error);
                throw new error_middleware_1.AppError('Failed to assign menus', 500, 'REPLACE_MENUS_FAILED');
            }
        }
        // Clear cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, roleId));
        logger_1.logger.info(`Menus replaced for role ${roleId}`);
    }
}
exports.RoleService = RoleService;
exports.roleService = new RoleService();
