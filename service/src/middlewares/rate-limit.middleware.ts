import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';

export const rateLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  handler: (_req, res) => {
    errorResponse(
      res,
      'Too many requests, please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    errorResponse(
      res,
      'Too many attempts, please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    errorResponse(
      res,
      'Too many login attempts, please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});
