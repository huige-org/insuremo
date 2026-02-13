"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideo = exports.updateVideo = exports.createVideo = exports.getVideoById = exports.getVideos = void 0;
const zod_1 = require("zod");
const video_service_1 = require("../services/video.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    keyword: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
});
const createVideoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    cover_url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    video_url: zod_1.z.string().url(),
    duration: zod_1.z.number().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateVideoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    cover_url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    video_url: zod_1.z.string().url().optional(),
    duration: zod_1.z.number().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
});
exports.getVideos = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid query parameters');
        return;
    }
    const { list, meta } = await video_service_1.videoService.findAll(result.data);
    (0, response_1.successResponse)(res, list, 200, meta);
});
exports.getVideoById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const video = await video_service_1.videoService.findById(req.params.id);
    (0, response_1.successResponse)(res, video);
});
exports.createVideo = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createVideoSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const video = await video_service_1.videoService.create(result.data, req.user.id);
    (0, response_1.createdResponse)(res, video);
});
exports.updateVideo = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = updateVideoSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const video = await video_service_1.videoService.update(req.params.id, result.data);
    (0, response_1.successResponse)(res, video);
});
exports.deleteVideo = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await video_service_1.videoService.delete(req.params.id);
    (0, response_1.noContentResponse)(res);
});
