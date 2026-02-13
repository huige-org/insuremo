"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getArticles = void 0;
const zod_1 = require("zod");
const article_service_1 = require("../services/article.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    keyword: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
});
const createArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    summary: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1),
    cover_url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateArticleSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    summary: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1).optional(),
    cover_url: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
});
exports.getArticles = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid query parameters');
        return;
    }
    const { list, meta } = await article_service_1.articleService.findAll(result.data);
    (0, response_1.successResponse)(res, list, 200, meta);
});
exports.getArticleById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const article = await article_service_1.articleService.findById(req.params.id);
    (0, response_1.successResponse)(res, article);
});
exports.createArticle = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createArticleSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const article = await article_service_1.articleService.create(result.data, req.user.id);
    (0, response_1.createdResponse)(res, article);
});
exports.updateArticle = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = updateArticleSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    const article = await article_service_1.articleService.update(req.params.id, result.data);
    (0, response_1.successResponse)(res, article);
});
exports.deleteArticle = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await article_service_1.articleService.delete(req.params.id);
    (0, response_1.noContentResponse)(res);
});
