import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/database';
import { asyncHandler } from '../middlewares/error.middleware';
import { badRequestResponse } from '../utils/response';
import { logger } from '../config/logger';

// 允许的图片 MIME 类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 允许的视频 MIME 类型
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// 最大文件大小 (5MB for images)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// 最大文件大小 (50MB for videos)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 上传图片到 Supabase Storage
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    badRequestResponse(res, '请选择要上传的文件');
    return;
  }

  const file = req.file;

  // 验证文件类型
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    badRequestResponse(res, '只能上传图片文件 (JPEG, PNG, GIF, WebP)');
    return;
  }

  // 验证文件大小
  if (file.size > MAX_IMAGE_SIZE) {
    badRequestResponse(res, '图片大小不能超过 5MB');
    return;
  }

  // 生成唯一文件名
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `images/${timestamp}-${randomString}.${fileExtension}`;

  try {
    const supabase = getSupabaseClient();
    
    // 上传到 Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('Upload image error:', error);
      badRequestResponse(res, '上传失败：' + error.message);
      return;
    }

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const result = {
      url: publicUrl,
      alt: file.originalname,
      href: publicUrl,
    };

    // 如果是富文本编辑器上传，返回 WangEditor 期望的格式
    if (req.query.editor === 'wangeditor') {
      res.status(200).json({
        errno: 0,
        data: result
      });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    logger.error('Upload image error:', error);
    res.status(200).json({
      errno: 1,
      message: '上传失败'
    });
  }
});

/**
 * 上传视频到 Supabase Storage
 */
export const uploadVideo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    badRequestResponse(res, '请选择要上传的文件');
    return;
  }

  const file = req.file;

  // 验证文件类型
  if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    badRequestResponse(res, '只能上传视频文件 (MP4, WebM, OGG)');
    return;
  }

  // 验证文件大小
  if (file.size > MAX_VIDEO_SIZE) {
    badRequestResponse(res, '视频大小不能超过 50MB');
    return;
  }

  // 生成唯一文件名
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `videos/${timestamp}-${randomString}.${fileExtension}`;

  try {
    const supabase = getSupabaseClient();
    
    // 上传到 Supabase Storage
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('Upload video error:', error);
      badRequestResponse(res, '上传失败：' + error.message);
      return;
    }

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // 返回 WangEditor 期望的响应格式
    res.status(200).json({
      errno: 0,
      data: {
        url: publicUrl,
        alt: file.originalname,
        poster: '',
      }
    });
  } catch (error) {
    logger.error('Upload video error:', error);
    res.status(200).json({
      errno: 1,
      message: '上传失败'
    });
  }
});
