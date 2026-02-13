"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidSchema = exports.passwordSchema = exports.emailSchema = exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const response_1 = require("./response");
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            (0, response_1.validationErrorResponse)(res, 'Validation failed', errors);
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            (0, response_1.validationErrorResponse)(res, 'Query validation failed', errors);
            return;
        }
        req.query = result.data;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join('.');
                errors[path] = issue.message;
            });
            (0, response_1.validationErrorResponse)(res, 'Params validation failed', errors);
            return;
        }
        req.params = result.data;
        next();
    };
};
exports.validateParams = validateParams;
exports.emailSchema = zod_1.z.string().email('Invalid email format');
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
