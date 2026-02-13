"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_service_1 = require("../services/article.service");
const video_service_1 = require("../services/video.service");
const case_service_1 = require("../services/case.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.get('/articles', (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const list = await article_service_1.articleService.findAll({ page: 1, pageSize: 100, status: 'published' });
    (0, response_1.successResponse)(res, list.list);
}));
router.get('/videos', (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const list = await video_service_1.videoService.findAll({ page: 1, pageSize: 100, status: 'published' });
    (0, response_1.successResponse)(res, list.list);
}));
router.get('/cases', (0, error_middleware_1.asyncHandler)(async (_req, res) => {
    const list = await case_service_1.caseService.findAll({ page: 1, pageSize: 100, status: 'published' });
    (0, response_1.successResponse)(res, list.list);
}));
exports.default = router;
