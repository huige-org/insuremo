"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const env_1 = require("./env");
const path_1 = __importDefault(require("path"));
const { combine, timestamp, json, errors, printf, colorize } = winston_1.default.format;
const logDir = path_1.default.resolve(env_1.env.LOG_DIR);
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
const createTransports = () => {
    const transports = [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ];
    if (env_1.env.NODE_ENV !== 'production') {
        transports.push(new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        }));
    }
    return transports;
};
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
    defaultMeta: {
        service: 'insure-admin-service',
        environment: env_1.env.NODE_ENV,
    },
    transports: createTransports(),
    exitOnError: false,
});
exports.stream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
