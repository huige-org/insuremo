"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisConnection = exports.getRedisClient = exports.createRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
let redisClient = null;
const createRedisClient = () => {
    if (!redisClient) {
        const redisHost = env_1.env.REDIS_HOST || "";
        const isUpstash = redisHost.includes("upstash");
        if (!env_1.env.REDIS_HOST) {
            logger_1.logger.warn("Redis host not configured");
            return {
                get: async () => null,
                set: async () => "OK",
                del: async () => 1,
                quit: async () => "OK",
                on: () => { },
            };
        }
        redisClient = new ioredis_1.default({
            host: env_1.env.REDIS_HOST,
            port: parseInt(env_1.env.REDIS_PORT, 10),
            password: env_1.env.REDIS_PASSWORD || undefined,
            db: parseInt(env_1.env.REDIS_DB, 10),
            retryStrategy: (times) => {
                if (isUpstash) {
                    return Math.min(times * 100, 3000);
                }
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: isUpstash ? null : 3,
            enableReadyCheck: !isUpstash,
            lazyConnect: true,
            tls: isUpstash ? {} : undefined,
        });
        redisClient.connect().catch((err) => {
            logger_1.logger.warn("Redis connection attempted:", err.message);
        });
        redisClient.on("connect", () => {
            logger_1.logger.info("Redis client connected");
        });
        redisClient.on("error", (err) => {
            logger_1.logger.error("Redis client error:", err.message);
        });
        redisClient.on("reconnecting", () => {
            logger_1.logger.warn("Redis client reconnecting");
        });
    }
    return redisClient;
};
exports.createRedisClient = createRedisClient;
const getRedisClient = () => {
    // 在Vercel环境下，或者没有配置Redis时，返回null或模拟客户端
    if (process.env.VERCEL || !env_1.env.REDIS_HOST) {
        logger_1.logger.warn("Redis not configured or running in Vercel environment, using mock client");
        // 返回一个模拟的Redis客户端，避免错误
        return {
            get: async () => null,
            set: async () => "OK",
            del: async () => 1,
            quit: async () => "OK",
            on: () => { },
        };
    }
    if (!redisClient) {
        return (0, exports.createRedisClient)();
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const closeRedisConnection = async () => {
    if (redisClient && !process.env.VERCEL) {
        await redisClient.quit();
        redisClient = null;
        logger_1.logger.info("Redis connection closed");
    }
};
exports.closeRedisConnection = closeRedisConnection;
