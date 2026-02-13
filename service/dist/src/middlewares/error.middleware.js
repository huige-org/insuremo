"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
const response_1 = require("../utils/response");
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 422;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = {};
        err.issues.forEach((issue) => {
            const path = issue.path.join('.');
            details[path] = issue.message;
        });
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Token has expired';
    }
    else if (err.name === 'SyntaxError' && 'body' in err) {
        statusCode = 400;
        code = 'INVALID_JSON';
        message = 'Invalid JSON payload';
    }
    logger_1.logger.error({
        message: err.message,
        code,
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
    });
    if (process.env.NODE_ENV === 'development') {
        details = {
            ...(details || {}),
            stack: err.stack,
        };
    }
    (0, response_1.errorResponse)(res, message, code, statusCode, details);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, _next) => {
    (0, response_1.errorResponse)(res, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND', 404);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
