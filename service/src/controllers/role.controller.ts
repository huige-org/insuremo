import { Request, Response } from 'express';
import { z } from 'zod';
import { roleService } from '../services/role.service';
import { menuService } from '../services/menu.service';
import { asyncHandler } from '../middlewares/error.middleware';
import {
  successResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
} from '../utils/response';
import { uuidSchema } from '../utils/validator';

const createRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  description: z.string().optional(),
  is_system: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
});

const roleIdSchema = z.object({
  id: uuidSchema,
});

const assignMenuSchema = z.object({
  menuIds: z.array(uuidSchema),
});

export const getRoles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid query parameters');
    return;
  }

  const { roles, meta } = await roleService.findAll(result.data);
  successResponse(res, roles, 200, meta);
});

export const getRoleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = roleIdSchema.safeParse(req.params);
  if (!result.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const role = await roleService.findById(result.data.id);
  successResponse(res, role);
});

export const createRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = createRoleSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const role = await roleService.create(result.data);
  createdResponse(res, role);
});

export const updateRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const paramsResult = roleIdSchema.safeParse(req.params);
  if (!paramsResult.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const bodyResult = updateRoleSchema.safeParse(req.body);
  if (!bodyResult.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const role = await roleService.update(paramsResult.data.id, bodyResult.data);
  successResponse(res, role);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = roleIdSchema.safeParse(req.params);
  if (!result.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  await roleService.delete(result.data.id);
  noContentResponse(res);
});

export const getMenusByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = roleIdSchema.safeParse(req.params);
  if (!result.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const menus = await menuService.findByRole(result.data.id);
  successResponse(res, menus);
});

export const assignMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const paramsResult = roleIdSchema.safeParse(req.params);
  if (!paramsResult.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const bodyResult = assignMenuSchema.safeParse(req.body);
  if (!bodyResult.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  await roleService.replaceMenus(paramsResult.data.id, bodyResult.data.menuIds);
  successResponse(res, { message: 'Menus assigned successfully' });
});

export const removeMenu = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const paramsResult = roleIdSchema.safeParse(req.params);
  if (!paramsResult.success) {
    badRequestResponse(res, 'Invalid role ID');
    return;
  }

  const bodyResult = assignMenuSchema.safeParse(req.body);
  if (!bodyResult.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  for (const menuId of bodyResult.data.menuIds) {
    await roleService.removeMenu(paramsResult.data.id, menuId);
  }
  successResponse(res, { message: 'Menus removed successfully' });
});
