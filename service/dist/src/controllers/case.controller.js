"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCase = exports.updateCase = exports.createCase = exports.getCaseById = exports.getCases = void 0;
const zod_1 = require("zod");
const case_service_1 = require("../services/case.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional(),
    pageSize: zod_1.z.coerce.number().positive().max(100).optional(),
    keyword: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'reviewing', 'offline', 'archived']).optional(),
});
const createCaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    summary: zod_1.z.string().optional(),
    detail: zod_1.z.string().min(1),
    cover: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    client: zod_1.z.string().optional(),
    completionDate: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional(),
    duration: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'reviewing', 'offline']).optional(),
});
const updateCaseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    summary: zod_1.z.string().optional(),
    detail: zod_1.z.string().min(1).optional(),
    cover: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    client: zod_1.z.string().optional(),
    completionDate: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional(),
    duration: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'published', 'reviewing', 'offline']).optional(),
});
// 转换数据库字段为前端字段
const toFrontendCase = (item) => ({
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
exports.getCases = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid query parameters');
        return;
    }
    const { list, meta } = await case_service_1.caseService.findAll(result.data);
    const frontendList = list.map(toFrontendCase);
    (0, response_1.successResponse)(res, frontendList, 200, meta);
});
exports.getCaseById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const caseItem = await case_service_1.caseService.findById(req.params.id);
    (0, response_1.successResponse)(res, toFrontendCase(caseItem));
});
exports.createCase = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = createCaseSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    // 转换前端字段名为数据库字段名
    const data = result.data;
    const dbData = {
        title: data.name,
        content: data.detail,
        summary: data.summary,
        cover_url: data.cover,
        category: data.industry,
        status: data.status === 'reviewing' ? 'draft' : data.status === 'offline' ? 'archived' : data.status || 'draft',
        published_at: data.status === 'published' ? new Date().toISOString() : null,
    };
    const caseItem = await case_service_1.caseService.create(dbData, req.user.id);
    (0, response_1.createdResponse)(res, caseItem);
});
exports.updateCase = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = updateCaseSchema.safeParse(req.body);
    if (!result.success) {
        (0, response_1.badRequestResponse)(res, 'Invalid request body');
        return;
    }
    // 转换前端字段名为数据库字段名
    const data = result.data;
    const dbData = {};
    if (data.name !== undefined)
        dbData.title = data.name;
    if (data.detail !== undefined)
        dbData.content = data.detail;
    if (data.summary !== undefined)
        dbData.summary = data.summary;
    if (data.cover !== undefined)
        dbData.cover_url = data.cover;
    if (data.industry !== undefined)
        dbData.category = data.industry;
    if (data.status !== undefined) {
        dbData.status = data.status === 'reviewing' ? 'draft' : data.status === 'offline' ? 'archived' : data.status;
        if (data.status === 'published') {
            dbData.published_at = new Date().toISOString();
        }
    }
    const caseItem = await case_service_1.caseService.update(req.params.id, dbData);
    (0, response_1.successResponse)(res, caseItem);
});
exports.deleteCase = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    await case_service_1.caseService.delete(req.params.id);
    (0, response_1.noContentResponse)(res);
});
