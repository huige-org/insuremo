import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { menuService } from '../services/menu.service';
import { asyncHandler } from '../middlewares/error.middleware';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
} from '../utils/response';
import { emailSchema, passwordSchema } from '../utils/validator';

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const authResponse = await authService.login(result.data);
  successResponse(res, authResponse);
});

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const authResponse = await authService.register(result.data);
  createdResponse(res, authResponse);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = refreshTokenSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const tokens = await authService.refreshToken(result.data.refreshToken);
  successResponse(res, { tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (userId) {
    await authService.logout(userId);
  }
  successResponse(res, { message: 'Logged out successfully' });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    badRequestResponse(res, 'User not authenticated');
    return;
  }

  const menus = await menuService.findByUser(userId);
  successResponse(res, { user: req.user, menus });
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    badRequestResponse(res, 'User not authenticated');
    return;
  }

  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  await authService.changePassword(
    userId,
    result.data.currentPassword,
    result.data.newPassword
  );
  successResponse(res, { message: 'Password changed successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    badRequestResponse(res, 'User not authenticated');
    return;
  }

  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const user = await authService.updateProfile(userId, result.data);
  successResponse(res, { user });
});
