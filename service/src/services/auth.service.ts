import { getSupabaseClient } from '../config/database';
import { logger } from '../config/logger';
import { cacheService } from './cache.service';
import { LoginDTO, RegisterDTO, AuthTokens, AuthResponse, TokenPayload } from '../models/auth.types';
import { AppError } from '../middlewares/error.middleware';
import { hashPassword, comparePassword, generateId } from '../utils/helpers';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  private supabase = getSupabaseClient();

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const { data: user, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'banned') {
      throw new AppError('Account has been banned', 403, 'ACCOUNT_BANNED');
    }

    // Auto-activate inactive users for development
    if (user.status === 'inactive') {
      await this.supabase
        .from('profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', user.id);
      user.status = 'active';
    }

    const isPasswordValid = await comparePassword(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
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

    const roles = (userRoles as any[] || [])
      .map((ur: any) => ur.role?.code)
      .filter((code: string | undefined): code is string => Boolean(code));

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      roles,
    });

    // Cache session
    await cacheService.set(`session:${user.id}`, { tokens, roles }, 24 * 60 * 60);

    logger.info(`User logged in: ${user.email}`);

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

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    // Check if email exists
    const { data: existingUser } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
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
        status: 'active',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !user) {
      logger.error('Registration error:', error);
      throw new AppError('Failed to create user', 500, 'REGISTRATION_FAILED');
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

    logger.info(`User registered: ${user.email}`);

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

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

      const { data: user } = await this.supabase
        .from('profiles')
        .select('id, email')
        .eq('id', decoded.userId)
        .single();

      if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      const { data: userRoles } = await this.supabase
        .from('user_roles')
        .select('role:roles(code)')
        .eq('user_id', user.id);

    const roles = (userRoles as any[] || [])
      .map((ur: any) => ur.role?.code)
      .filter((code: string | undefined): code is string => Boolean(code));

      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        roles,
      });

      await cacheService.set(`session:${user.id}`, { tokens, roles }, 24 * 60 * 60);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async logout(userId: string): Promise<void> {
    await cacheService.delete(`session:${userId}`);
    logger.info(`User logged out: ${userId}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const { data: user } = await this.supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    const newPasswordHash = await hashPassword(newPassword);

    const { error } = await this.supabase
      .from('profiles')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to change password', 500, 'PASSWORD_CHANGE_FAILED');
    }

    // Clear all sessions
    await cacheService.delete(`session:${userId}`);

    logger.info(`Password changed for user: ${userId}`);
  }
}

export const authService = new AuthService();
