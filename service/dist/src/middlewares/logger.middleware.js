"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = exports.requestLogger = void 0;
const logger_1 = require("../config/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id,
            requestId: req.get('x-request-id'),
        };
        if (res.statusCode >= 500) {
            logger_1.logger.error(logData);
        }
        else if (res.statusCode >= 400) {
            logger_1.logger.warn(logData);
        }
        else {
            logger_1.logger.info(logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
const requestId = (req, res, next) => {
    const requestId = req.get('x-request-id') || crypto.randomUUID();
    res.setHeader('x-request-id', requestId);
    next();
};
exports.requestId = requestId;
