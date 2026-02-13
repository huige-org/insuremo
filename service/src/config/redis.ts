import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (!redisClient) {
    const isUpstash = env.REDIS_HOST.includes("upstash");

    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10),
      password: env.REDIS_PASSWORD || undefined,
      db: parseInt(env.REDIS_DB, 10),
      retryStrategy: (times: number) => {
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
      logger.warn("Redis connection attempted:", err.message);
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connected");
    });

    redisClient.on("error", (err: Error) => {
      logger.error("Redis client error:", err.message);
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis client reconnecting");
    });
  }
  return redisClient;
};

export const getRedisClient = (): Redis => {
  // 在Vercel环境下，或者没有配置Redis时，返回null或模拟客户端
  if (process.env.VERCEL || !env.REDIS_HOST) {
    logger.warn(
      "Redis not configured or running in Vercel environment, using mock client"
    );
    // 返回一个模拟的Redis客户端，避免错误
    return {
      get: async () => null,
      set: async () => "OK",
      del: async () => 1,
      quit: async () => "OK",
      on: () => {},
    } as unknown as Redis;
  }

  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient && !process.env.VERCEL) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis connection closed");
  }
};
