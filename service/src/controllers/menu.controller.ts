import { Request, Response } from 'express';
import { z } from 'zod';
import { menuService } from '../services/menu.service';
import { asyncHandler } from '../middlewares/error.middleware';
import {
  successResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
} from '../utils/response';
import { uuidSchema } from '../utils/validator';

const createMenuSchema = z.object({
  parent_id: uuidSchema.optional().nullable(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  path: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.coerce.number().optional(),
  type: z.enum(['directory', 'menu', 'button']),
  permission: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateMenuSchema = z.object({
  parent_id: uuidSchema.optional().nullable(),
  name: z.string().min(2).optional(),
  path: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.coerce.number().optional(),
  type: z.enum(['directory', 'menu', 'button']).optional(),
  permission: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  type: z.enum(['directory', 'menu', 'button']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const menuIdSchema = z.object({
  id: uuidSchema,
});

const roleIdSchema = z.object({
  roleId: uuidSchema,
});

export const getMenus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid query parameters');
    return;
  }

  const { menus, meta } = await menuService.findAll(result.data);
  successResponse(res, menus, 200, meta);
});

export const getMenuTree = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const tree = await menuService.findTree();
  successResponse(res, tree);
});

export const getMenusByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = roleIdSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const menus = await menuService.findByRole(result.data.roleId);
  successResponse(res, menus);
});

export const getMenuById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = menuIdSchema.safeParse(req.params);
  if (!result.success) {
    badRequestResponse(res, 'Invalid menu ID');
    return;
  }

  const menu = await menuService.findById(result.data.id);
  successResponse(res, menu);
});

export const createMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = createMenuSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const menu = await menuService.create(result.data);
  createdResponse(res, menu);
});

export const updateMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const paramsResult = menuIdSchema.safeParse(req.params);
  if (!paramsResult.success) {
    badRequestResponse(res, 'Invalid menu ID');
    return;
  }

  const bodyResult = updateMenuSchema.safeParse(req.body);
  if (!bodyResult.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const menu = await menuService.update(paramsResult.data.id, bodyResult.data);
  successResponse(res, menu);
});

export const deleteMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = menuIdSchema.safeParse(req.params);
  if (!result.success) {
    badRequestResponse(res, 'Invalid menu ID');
    return;
  }

  await menuService.delete(result.data.id);
  noContentResponse(res);
});
