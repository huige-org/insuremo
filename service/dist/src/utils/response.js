"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorResponse = exports.conflictResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.badRequestResponse = exports.noContentResponse = exports.createdResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
const errorResponse = (res, message, code = 'INTERNAL_ERROR', statusCode = 500, details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
const createdResponse = (res, data) => {
    return (0, exports.successResponse)(res, data, 201);
};
exports.createdResponse = createdResponse;
const noContentResponse = (res) => {
    return res.status(204).send();
};
exports.noContentResponse = noContentResponse;
const badRequestResponse = (res, message, code = 'BAD_REQUEST', details) => {
    return (0, exports.errorResponse)(res, message, code, 400, details);
};
exports.badRequestResponse = badRequestResponse;
const unauthorizedResponse = (res, message = 'Unauthorized', code = 'UNAUTHORIZED') => {
    return (0, exports.errorResponse)(res, message, code, 401);
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = (res, message = 'Forbidden', code = 'FORBIDDEN') => {
    return (0, exports.errorResponse)(res, message, code, 403);
};
exports.forbiddenResponse = forbiddenResponse;
const notFoundResponse = (res, message = 'Not Found', code = 'NOT_FOUND') => {
    return (0, exports.errorResponse)(res, message, code, 404);
};
exports.notFoundResponse = notFoundResponse;
const conflictResponse = (res, message, code = 'CONFLICT') => {
    return (0, exports.errorResponse)(res, message, code, 409);
};
exports.conflictResponse = conflictResponse;
const validationErrorResponse = (res, message, details) => {
    return (0, exports.errorResponse)(res, message, 'VALIDATION_ERROR', 422, details);
};
exports.validationErrorResponse = validationErrorResponse;
