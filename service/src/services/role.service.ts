import { getSupabaseClient } from '../config/database';
import { logger } from '../config/logger';
import { cacheService } from './cache.service';
import {
  Role,
  CreateRoleDTO,
  UpdateRoleDTO,
  RoleResponse,
} from '../models/role.types';
import { AppError } from '../middlewares/error.middleware';
import { PaginationParams, PaginationMeta } from '../models/common.types';
import { generateId } from '../utils/helpers';

export class RoleService {
  private supabase = getSupabaseClient();
  private cachePrefix = 'role';

  private mapToResponse(role: Role, menuIds: string[] = [], userCount: number = 0): RoleResponse {
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

  async findAll(
    params: PaginationParams & { search?: string }
  ): Promise<{ roles: RoleResponse[]; meta: PaginationMeta }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    let query = this.supabase.from('roles').select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,code.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      logger.error('Find all roles error:', error);
      throw new AppError('Failed to fetch roles', 500, 'FETCH_ROLES_FAILED');
    }

    const roles = (data || []) as Role[];

    // Get user counts for each role
    const roleIds = roles.map((r) => r.id);
    const { data: roleUserCounts } = await this.supabase
      .from('user_roles')
      .select('role_id')
      .in('role_id', roleIds);

    const userCountMap = new Map<string, number>();
    roleUserCounts?.forEach((ur) => {
      const current = userCountMap.get(ur.role_id) || 0;
      userCountMap.set(ur.role_id, current + 1);
    });

    const rolesWithCounts = roles.map((role) =>
      this.mapToResponse(role, [], userCountMap.get(role.id) || 0)
    );

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

  async findById(id: string): Promise<RoleResponse> {
    const cacheKey = cacheService.generateKey(this.cachePrefix, id);

    const cached = await cacheService.get<RoleResponse>(cacheKey);
    if (cached) return cached;

    const { data: role, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !role) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
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

    const response = this.mapToResponse(role as Role, menuIds, count || 0);
    await cacheService.set(cacheKey, response, 3600);

    return response;
  }

  async create(dto: CreateRoleDTO): Promise<RoleResponse> {
    // Check code exists
    const { data: existing } = await this.supabase
      .from('roles')
      .select('id')
      .eq('code', dto.code)
      .single();

    if (existing) {
      throw new AppError('Role code already exists', 409, 'CODE_EXISTS');
    }

    const roleId = generateId();

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
      logger.error('Create role error:', error);
      throw new AppError('Failed to create role', 500, 'CREATE_ROLE_FAILED');
    }

    logger.info(`Role created: ${role.name}`);

    return this.mapToResponse(role as Role);
  }

  async update(id: string, dto: UpdateRoleDTO): Promise<RoleResponse> {
    const { data: existingRole } = await this.supabase
      .from('roles')
      .select('is_system')
      .eq('id', id)
      .single();

    if (existingRole?.is_system) {
      throw new AppError('Cannot modify system role', 403, 'SYSTEM_ROLE_PROTECTED');
    }

    const updateData: Partial<Role> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status) updateData.status = dto.status;

    const { data: role, error } = await this.supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !role) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, id));

    logger.info(`Role updated: ${role.name}`);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const { data: role } = await this.supabase
      .from('roles')
      .select('is_system')
      .eq('id', id)
      .single();

    if (role?.is_system) {
      throw new AppError('Cannot delete system role', 403, 'SYSTEM_ROLE_PROTECTED');
    }

    const { error } = await this.supabase.from('roles').delete().eq('id', id);

    if (error) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, id));

    logger.info(`Role deleted: ${id}`);
  }

  async assignMenu(roleId: string, menuId: string): Promise<void> {
    const { error } = await this.supabase.from('role_menus').insert({
      role_id: roleId,
      menu_id: menuId,
    });

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Menu already assigned', 409, 'MENU_ALREADY_ASSIGNED');
      }
      throw new AppError('Failed to assign menu', 500, 'ASSIGN_MENU_FAILED');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, roleId));

    logger.info(`Menu ${menuId} assigned to role ${roleId}`);
  }

  async removeMenu(roleId: string, menuId: string): Promise<void> {
    const { error } = await this.supabase
      .from('role_menus')
      .delete()
      .eq('role_id', roleId)
      .eq('menu_id', menuId);

    if (error) {
      throw new AppError('Failed to remove menu', 500, 'REMOVE_MENU_FAILED');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, roleId));

    logger.info(`Menu ${menuId} removed from role ${roleId}`);
  }

  async replaceMenus(roleId: string, menuIds: string[]): Promise<void> {
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
        logger.error('Replace menus error:', error);
        throw new AppError('Failed to assign menus', 500, 'REPLACE_MENUS_FAILED');
      }
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, roleId));

    logger.info(`Menus replaced for role ${roleId}`);
  }
}

export const roleService = new RoleService();
