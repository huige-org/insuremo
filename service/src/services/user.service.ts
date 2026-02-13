import { getSupabaseClient } from '../config/database';
import { logger } from '../config/logger';
import { cacheService } from './cache.service';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserResponse,
} from '../models/user.types';
import { AppError } from '../middlewares/error.middleware';
import { PaginationParams, PaginationMeta } from '../models/common.types';
import { hashPassword, generateId } from '../utils/helpers';

export class UserService {
  private supabase = getSupabaseClient();
  private cachePrefix = 'user';

  private mapToResponse(user: User, roles: string[] = []): UserResponse {
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

  async findAll(
    params: PaginationParams & { search?: string; status?: string }
  ): Promise<{ users: UserResponse[]; meta: PaginationMeta }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;

    let query = this.supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(
        `email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`
      );
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      logger.error('Find all users error:', error);
      throw new AppError('Failed to fetch users', 500, 'FETCH_USERS_FAILED');
    }

    const users = (data || []) as User[];

    // Fetch roles for all users
    const userIds = users.map((u) => u.id);
    const { data: userRoles } = await this.supabase
      .from('user_roles')
      .select('user_id, role:roles(code)')
      .in('user_id', userIds);

    const rolesMap = new Map<string, string[]>();
    (userRoles as any[] || []).forEach((ur: any) => {
      if (!rolesMap.has(ur.user_id)) {
        rolesMap.set(ur.user_id, []);
      }
      if (ur.role?.code) {
        rolesMap.get(ur.user_id)?.push(ur.role.code);
      }
    });

    const usersWithRoles = users.map((user) =>
      this.mapToResponse(user, rolesMap.get(user.id) || [])
    );

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

  async findById(id: string): Promise<UserResponse> {
    const cacheKey = cacheService.generateKey(this.cachePrefix, id);

    const cached = await cacheService.get<UserResponse>(cacheKey);
    if (cached) return cached;

    const { data: user, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const { data: userRoles } = await this.supabase
      .from('user_roles')
      .select('role:roles(code)')
      .eq('user_id', id);

    const roles = (userRoles as any[] || [])
      .map((ur: any) => ur.role?.code)
      .filter((code: string | undefined): code is string => Boolean(code));

    const response = this.mapToResponse(user as User, roles);
    await cacheService.set(cacheKey, response, 3600);

    return response;
  }

  async create(dto: CreateUserDTO): Promise<UserResponse> {
    const { data: existing } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existing) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(dto.password);
    const userId = generateId();

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
      logger.error('Create user error:', error);
      throw new AppError('Failed to create user', 500, 'CREATE_USER_FAILED');
    }

    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.assignRoles(userId, dto.roleIds);
    }

    logger.info(`User created: ${user.email}`);

    return this.findById(userId);
  }

  async update(id: string, dto: UpdateUserDTO): Promise<UserResponse> {
    const updateData: Partial<User> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.email) updateData.email = dto.email;
    if (dto.full_name !== undefined) updateData.full_name = dto.full_name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatar_url !== undefined) updateData.avatar_url = dto.avatar_url;
    if (dto.status) updateData.status = dto.status;

    const { data: user, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (dto.roleIds) {
      await this.replaceRoles(id, dto.roleIds);
    }

    await cacheService.delete(cacheService.generateKey(this.cachePrefix, id));

    logger.info(`User updated: ${user.email}`);

    return this.findById(id);
  }

  async replaceRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.supabase.from('user_roles').delete().eq('user_id', userId);
    if (roleIds.length > 0) {
      await this.assignRoles(userId, roleIds);
    }
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    const roleMappings = roleIds.map(roleId => ({
      user_id: userId,
      role_id: roleId,
    }));
    const { error } = await this.supabase.from('user_roles').insert(roleMappings);
    if (error) {
      logger.error('Assign roles error:', error);
      throw new AppError('Failed to assign roles', 500, 'ASSIGN_ROLES_FAILED');
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('profiles').delete().eq('id', id);

    if (error) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, id));

    logger.info(`User deleted: ${id}`);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase.from('user_roles').insert({
      user_id: userId,
      role_id: roleId,
    });

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Role already assigned', 409, 'ROLE_ALREADY_ASSIGNED');
      }
      throw new AppError('Failed to assign role', 500, 'ASSIGN_ROLE_FAILED');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, userId));

    logger.info(`Role ${roleId} assigned to user ${userId}`);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      throw new AppError('Failed to remove role', 500, 'REMOVE_ROLE_FAILED');
    }

    // Clear cache
    await cacheService.delete(cacheService.generateKey(this.cachePrefix, userId));

    logger.info(`Role ${roleId} removed from user ${userId}`);
  }
}

export const userService = new UserService();
