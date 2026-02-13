"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.strictRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(env_1.env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env_1.env.RATE_LIMIT_MAX_REQUESTS, 10),
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
        (0, response_1.errorResponse)(res, 'Too many requests, please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    },
});
exports.strictRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
        (0, response_1.errorResponse)(res, 'Too many attempts, please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    },
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 login attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => {
        (0, response_1.errorResponse)(res, 'Too many login attempts, please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    },
});
