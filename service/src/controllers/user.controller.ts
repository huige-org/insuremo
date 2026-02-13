import { Request, Response } from "express";
import { z } from "zod";
import { userService } from "../services/user.service";
import { asyncHandler } from "../middlewares/error.middleware";
import {
  successResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
} from "../utils/response";
import { emailSchema, passwordSchema, uuidSchema } from "../utils/validator";

const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  roleIds: z.array(uuidSchema).optional(),
});

const updateUserSchema = z.object({
  email: emailSchema.optional(),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  roleIds: z.array(uuidSchema).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
});

const userIdSchema = z.object({
  id: uuidSchema,
});

const assignRoleSchema = z.object({
  roleIds: z.array(uuidSchema),
});

const assignSingleRoleSchema = z.object({
  roleId: uuidSchema,
});

export const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
      badRequestResponse(res, "Invalid query parameters");
      return;
    }

    const { users, meta } = await userService.findAll(result.data);
    successResponse(res, users, 200, meta);
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = userIdSchema.safeParse(req.params);
    if (!result.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const user = await userService.findById(result.data.id);
    successResponse(res, user);
  }
);

export const createUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    const user = await userService.create(result.data);
    createdResponse(res, user);
  }
);

export const updateUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    const user = await userService.update(
      paramsResult.data.id,
      bodyResult.data
    );
    successResponse(res, user);
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = userIdSchema.safeParse(req.params);
    if (!result.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    await userService.delete(result.data.id);
    noContentResponse(res);
  }
);

export const assignRole = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const bodyResult = assignSingleRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    await userService.assignRole(paramsResult.data.id, bodyResult.data.roleId);
    successResponse(res, { message: "Role assigned successfully" });
  }
);

export const removeRole = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const bodyResult = assignSingleRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    await userService.removeRole(paramsResult.data.id, bodyResult.data.roleId);
    successResponse(res, { message: "Role removed successfully" });
  }
);

export const assignRoles = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const bodyResult = assignRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    await userService.replaceRoles(
      paramsResult.data.id,
      bodyResult.data.roleIds
    );
    successResponse(res, { message: "Roles assigned successfully" });
  }
);

export const removeRoles = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const paramsResult = userIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      badRequestResponse(res, "Invalid user ID");
      return;
    }

    const bodyResult = assignRoleSchema.safeParse(req.body);
    if (!bodyResult.success) {
      badRequestResponse(res, "Invalid request body");
      return;
    }

    // Remove specified roles (not all roles)
    for (const roleId of bodyResult.data.roleIds) {
      await userService.removeRole(paramsResult.data.id, roleId);
    }
    successResponse(res, { message: "Roles removed successfully" });
  }
);
