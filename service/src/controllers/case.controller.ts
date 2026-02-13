import { Request, Response } from 'express';
import { z } from 'zod';
import { caseService } from '../services/case.service';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse, createdResponse, noContentResponse, badRequestResponse } from '../utils/response';
import { CreateCaseDTO, UpdateCaseDTO } from '../models/case.types';

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  keyword: z.string().optional(),
  status: z.enum(['draft', 'published', 'reviewing', 'offline', 'archived']).optional(),
});

const createCaseSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional(),
  detail: z.string().min(1),
  cover: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  client: z.string().optional(),
  completionDate: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(['draft', 'published', 'reviewing', 'offline']).optional(),
});

const updateCaseSchema = z.object({
  name: z.string().min(1).optional(),
  summary: z.string().optional(),
  detail: z.string().min(1).optional(),
  cover: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  client: z.string().optional(),
  completionDate: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(['draft', 'published', 'reviewing', 'offline']).optional(),
});

// 转换数据库字段为前端字段
const toFrontendCase = (item: any) => ({
  id: item.id,
  name: item.title,
  summary: item.summary,
  detail: item.content,
  cover: item.cover_url,
  industry: item.category,
  status: item.status === 'draft' ? 'reviewing' : item.status === 'archived' ? 'offline' : item.status,
  client: item.client,
  completionDate: item.completionDate,
  duration: item.duration,
  view_count: item.view_count,
  like_count: item.like_count,
  share_count: item.share_count,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

export const getCases = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid query parameters');
    return;
  }

  const { list, meta } = await caseService.findAll(result.data);
  const frontendList = list.map(toFrontendCase);
  successResponse(res, frontendList, 200, meta);
});

export const getCaseById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const caseItem = await caseService.findById(req.params.id as string);
  successResponse(res, toFrontendCase(caseItem));
});

export const createCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = createCaseSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  // 转换前端字段名为数据库字段名
  const data = result.data;
  const dbData: CreateCaseDTO = {
    title: data.name,
    content: data.detail,
    summary: data.summary,
    cover_url: data.cover,
    category: data.industry,
    status: data.status === 'reviewing' ? 'draft' : data.status === 'offline' ? 'archived' : data.status || 'draft',
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  };

  const caseItem = await caseService.create(dbData, req.user!.id);
  createdResponse(res, caseItem);
});

export const updateCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = updateCaseSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  // 转换前端字段名为数据库字段名
  const data = result.data;
  const dbData: UpdateCaseDTO = {};
  
  if (data.name !== undefined) dbData.title = data.name;
  if (data.detail !== undefined) dbData.content = data.detail;
  if (data.summary !== undefined) dbData.summary = data.summary;
  if (data.cover !== undefined) dbData.cover_url = data.cover;
  if (data.industry !== undefined) dbData.category = data.industry;
  if (data.status !== undefined) {
    dbData.status = data.status === 'reviewing' ? 'draft' : data.status === 'offline' ? 'archived' : data.status;
    if (data.status === 'published') {
      dbData.published_at = new Date().toISOString();
    }
  }

  const caseItem = await caseService.update(req.params.id as string, dbData);
  successResponse(res, caseItem);
});

export const deleteCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await caseService.delete(req.params.id as string);
  noContentResponse(res);
});
