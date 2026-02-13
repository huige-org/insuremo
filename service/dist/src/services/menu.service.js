"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuService = exports.MenuService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const cache_service_1 = require("./cache.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const helpers_1 = require("../utils/helpers");
class MenuService {
    supabase = (0, database_1.getSupabaseClient)();
    cachePrefix = 'menu';
    mapToResponse(menu) {
        return {
            id: menu.id,
            parent_id: menu.parent_id,
            name: menu.name,
            code: menu.code,
            path: menu.path,
            icon: menu.icon,
            sort_order: menu.sort_order,
            type: menu.type,
            permission: menu.permission,
            status: menu.status,
            created_at: menu.created_at,
            updated_at: menu.updated_at,
        };
    }
    buildTree(menus, parentId = null) {
        const result = [];
        for (const menu of menus) {
            if (menu.parent_id === parentId) {
                const children = this.buildTree(menus, menu.id);
                result.push({
                    ...menu,
                    title: menu.name,
                    children,
                });
            }
        }
        return result.sort((a, b) => a.sort_order - b.sort_order);
    }
    async findAll(params) {
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        let query = this.supabase.from('menus').select('*', { count: 'exact' });
        if (params.type) {
            query = query.eq('type', params.type);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        const { data, error, count } = await query
            .order('sort_order', { ascending: true })
            .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) {
            logger_1.logger.error('Find all menus error:', error);
            throw new error_middleware_1.AppError('Failed to fetch menus', 500, 'FETCH_MENUS_FAILED');
        }
        const total = count || 0;
        const totalPages = Math.ceil(total / pageSize);
        return {
            menus: (data || []).map((m) => this.mapToResponse(m)),
            meta: {
                page,
                pageSize,
                total,
                totalPages,
            },
        };
    }
    async findTree() {
        const cacheKey = cache_service_1.cacheService.generateKey(this.cachePrefix, 'tree');
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const { data, error } = await this.supabase
            .from('menus')
            .select('*')
            .eq('status', 'active')
            .order('sort_order', { ascending: true });
        if (error) {
            logger_1.logger.error('Find menu tree error:', error);
            throw new error_middleware_1.AppError('Failed to fetch menu tree', 500, 'FETCH_MENU_TREE_FAILED');
        }
        const tree = this.buildTree((data || []));
        await cache_service_1.cacheService.set(cacheKey, tree, 3600);
        return tree;
    }
    async findByRole(roleId) {
        const cacheKey = cache_service_1.cacheService.generateKey(this.cachePrefix, 'role', roleId);
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const { data: roleMenus } = await this.supabase
            .from('role_menus')
            .select('menu_id')
            .eq('role_id', roleId);
        const menuIds = roleMenus?.map((rm) => rm.menu_id) || [];
        if (menuIds.length === 0) {
            return [];
        }
        const { data, error } = await this.supabase
            .from('menus')
            .select('*')
            .in('id', menuIds)
            .eq('status', 'active')
            .order('sort_order', { ascending: true });
        if (error) {
            logger_1.logger.error('Find menus by role error:', error);
            throw new error_middleware_1.AppError('Failed to fetch role menus', 500, 'FETCH_ROLE_MENUS_FAILED');
        }
        const tree = this.buildTree((data || []));
        await cache_service_1.cacheService.set(cacheKey, tree, 3600);
        return tree;
    }
    async findByUser(userId) {
        const cacheKey = cache_service_1.cacheService.generateKey(this.cachePrefix, 'user', userId);
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const { data: userRoles } = await this.supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', userId);
        const roleIds = userRoles?.map((ur) => ur.role_id) || [];
        if (roleIds.length === 0) {
            return [];
        }
        const { data: roleMenus } = await this.supabase
            .from('role_menus')
            .select('menu_id')
            .in('role_id', roleIds);
        const menuIds = [...new Set(roleMenus?.map((rm) => rm.menu_id) || [])];
        if (menuIds.length === 0) {
            return [];
        }
        const { data, error } = await this.supabase
            .from('menus')
            .select('*')
            .in('id', menuIds)
            .eq('status', 'active')
            .order('sort_order', { ascending: true });
        if (error) {
            logger_1.logger.error('Find menus by user error:', error);
            throw new error_middleware_1.AppError('Failed to fetch user menus', 500, 'FETCH_USER_MENUS_FAILED');
        }
        const tree = this.buildTree((data || []));
        await cache_service_1.cacheService.set(cacheKey, tree, 3600);
        return tree;
    }
    async findById(id) {
        const cacheKey = cache_service_1.cacheService.generateKey(this.cachePrefix, id);
        const cached = await cache_service_1.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const { data: menu, error } = await this.supabase
            .from('menus')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !menu) {
            throw new error_middleware_1.AppError('Menu not found', 404, 'MENU_NOT_FOUND');
        }
        const response = this.mapToResponse(menu);
        await cache_service_1.cacheService.set(cacheKey, response, 3600);
        return response;
    }
    async create(dto) {
        // Check code exists
        const { data: existing } = await this.supabase
            .from('menus')
            .select('id')
            .eq('code', dto.code)
            .single();
        if (existing) {
            throw new error_middleware_1.AppError('Menu code already exists', 409, 'CODE_EXISTS');
        }
        // Validate parent if provided
        if (dto.parent_id) {
            const { data: parent } = await this.supabase
                .from('menus')
                .select('id')
                .eq('id', dto.parent_id)
                .single();
            if (!parent) {
                throw new error_middleware_1.AppError('Parent menu not found', 404, 'PARENT_MENU_NOT_FOUND');
            }
        }
        const menuId = (0, helpers_1.generateId)();
        const { data: menu, error } = await this.supabase
            .from('menus')
            .insert({
            id: menuId,
            parent_id: dto.parent_id || null,
            name: dto.name,
            code: dto.code,
            path: dto.path || null,
            icon: dto.icon || null,
            sort_order: dto.sort_order || 0,
            type: dto.type,
            permission: dto.permission || null,
            status: dto.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error || !menu) {
            logger_1.logger.error('Create menu error:', error);
            throw new error_middleware_1.AppError('Failed to create menu', 500, 'CREATE_MENU_FAILED');
        }
        // Clear tree cache
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, 'tree'));
        logger_1.logger.info(`Menu created: ${menu.name}`);
        return this.mapToResponse(menu);
    }
    async update(id, dto) {
        // Check for circular reference
        if (dto.parent_id === id) {
            throw new error_middleware_1.AppError('Menu cannot be its own parent', 400, 'CIRCULAR_REFERENCE');
        }
        // Validate parent if provided
        if (dto.parent_id) {
            const { data: parent } = await this.supabase
                .from('menus')
                .select('id')
                .eq('id', dto.parent_id)
                .single();
            if (!parent) {
                throw new error_middleware_1.AppError('Parent menu not found', 404, 'PARENT_MENU_NOT_FOUND');
            }
        }
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (dto.parent_id !== undefined)
            updateData.parent_id = dto.parent_id;
        if (dto.name)
            updateData.name = dto.name;
        if (dto.path !== undefined)
            updateData.path = dto.path;
        if (dto.icon !== undefined)
            updateData.icon = dto.icon;
        if (dto.sort_order !== undefined)
            updateData.sort_order = dto.sort_order;
        if (dto.type)
            updateData.type = dto.type;
        if (dto.permission !== undefined)
            updateData.permission = dto.permission;
        if (dto.status)
            updateData.status = dto.status;
        const { data: menu, error } = await this.supabase
            .from('menus')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error || !menu) {
            throw new error_middleware_1.AppError('Menu not found', 404, 'MENU_NOT_FOUND');
        }
        // Clear caches
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, 'tree'));
        logger_1.logger.info(`Menu updated: ${menu.name}`);
        return this.findById(id);
    }
    async delete(id) {
        // Check if menu has children
        const { data: children } = await this.supabase
            .from('menus')
            .select('id')
            .eq('parent_id', id);
        if (children && children.length > 0) {
            throw new error_middleware_1.AppError('Cannot delete menu with children', 400, 'MENU_HAS_CHILDREN');
        }
        const { error } = await this.supabase.from('menus').delete().eq('id', id);
        if (error) {
            throw new error_middleware_1.AppError('Menu not found', 404, 'MENU_NOT_FOUND');
        }
        // Clear caches
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, id));
        await cache_service_1.cacheService.delete(cache_service_1.cacheService.generateKey(this.cachePrefix, 'tree'));
        logger_1.logger.info(`Menu deleted: ${id}`);
    }
}
exports.MenuService = MenuService;
exports.menuService = new MenuService();
