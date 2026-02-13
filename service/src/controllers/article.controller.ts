import { Request, Response } from 'express';
import { z } from 'zod';
import { articleService } from '../services/article.service';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse, createdResponse, noContentResponse, badRequestResponse } from '../utils/response';
import { CreateArticleDTO, UpdateArticleDTO } from '../models/article.types';

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  keyword: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

const createArticleSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  content: z.string().min(1),
  cover_url: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  content: z.string().min(1).optional(),
  cover_url: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const getArticles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid query parameters');
    return;
  }

  const { list, meta } = await articleService.findAll(result.data);
  successResponse(res, list, 200, meta);
});

export const getArticleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const article = await articleService.findById(req.params.id as string);
  successResponse(res, article);
});

export const createArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = createArticleSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const article = await articleService.create(result.data as CreateArticleDTO, req.user!.id);
  createdResponse(res, article);
});

export const updateArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = updateArticleSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const article = await articleService.update(req.params.id as string, result.data as UpdateArticleDTO);
  successResponse(res, article);
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await articleService.delete(req.params.id as string);
  noContentResponse(res);
});
