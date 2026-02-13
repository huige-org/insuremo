"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 配置 multer - 使用内存存储
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max (在控制器中会进一步限制)
    },
});
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */
/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload image file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Public URL of the uploaded image
 *                     path:
 *                       type: string
 *                       description: Storage path
 *                     name:
 *                       type: string
 *                       description: Original file name
 *                     size:
 *                       type: number
 *                       description: File size in bytes
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/image', auth_middleware_1.authenticate, upload.single('file'), upload_controller_1.uploadImage);
/**
 * @swagger
 * /api/v1/upload/video:
 *   post:
 *     summary: Upload video file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Video file (MP4, WebM, OGG, max 50MB)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Public URL of the uploaded video
 *                     path:
 *                       type: string
 *                       description: Storage path
 *                     name:
 *                       type: string
 *                       description: Original file name
 *                     size:
 *                       type: number
 *                       description: File size in bytes
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post('/video', auth_middleware_1.authenticate, upload.single('file'), upload_controller_1.uploadVideo);
exports.default = router;
