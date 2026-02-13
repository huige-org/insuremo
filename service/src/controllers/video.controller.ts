import { Request, Response } from 'express';
import { z } from 'zod';
import { videoService } from '../services/video.service';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse, createdResponse, noContentResponse, badRequestResponse } from '../utils/response';
import { CreateVideoDTO, UpdateVideoDTO } from '../models/video.types';

const paginationSchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  keyword: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

const createVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url(),
  duration: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional(),
  duration: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const getVideos = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    badRequestResponse(res, 'Invalid query parameters');
    return;
  }

  const { list, meta } = await videoService.findAll(result.data);
  successResponse(res, list, 200, meta);
});

export const getVideoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const video = await videoService.findById(req.params.id as string);
  successResponse(res, video);
});

export const createVideo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = createVideoSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const video = await videoService.create(result.data as CreateVideoDTO, req.user!.id);
  createdResponse(res, video);
});

export const updateVideo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = updateVideoSchema.safeParse(req.body);
  if (!result.success) {
    badRequestResponse(res, 'Invalid request body');
    return;
  }

  const video = await videoService.update(req.params.id as string, result.data as UpdateVideoDTO);
  successResponse(res, video);
});

export const deleteVideo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await videoService.delete(req.params.id as string);
  noContentResponse(res);
});
