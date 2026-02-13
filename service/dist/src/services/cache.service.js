"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
const DEFAULT_TTL = 3600; // 1 hour in seconds
class CacheService {
    redis = (0, redis_1.getRedisClient)();
    async get(key) {
        try {
            const data = await this.redis.get(key);
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (error) {
            logger_1.logger.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttl = DEFAULT_TTL) {
        try {
            const serialized = JSON.stringify(value);
            await this.redis.setex(key, ttl, serialized);
        }
        catch (error) {
            logger_1.logger.error('Cache set error:', error);
        }
    }
    async delete(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            logger_1.logger.error('Cache delete error:', error);
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error('Cache exists error:', error);
            return false;
        }
    }
    async getOrSet(key, factory, ttl = DEFAULT_TTL) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
    async increment(key, amount = 1) {
        try {
            return await this.redis.incrby(key, amount);
        }
        catch (error) {
            logger_1.logger.error('Cache increment error:', error);
            return 0;
        }
    }
    async expire(key, seconds) {
        try {
            await this.redis.expire(key, seconds);
        }
        catch (error) {
            logger_1.logger.error('Cache expire error:', error);
        }
    }
    async flush() {
        try {
            await this.redis.flushdb();
            logger_1.logger.info('Cache flushed');
        }
        catch (error) {
            logger_1.logger.error('Cache flush error:', error);
        }
    }
    generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
