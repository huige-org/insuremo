"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z.string().default("3000"), // Vercel默认端口
    API_PREFIX: zod_1.z.string().default("/api/v1"),
    VERCEL_URL: zod_1.z.string().optional(),
    CORS_ORIGIN: zod_1.z.string().optional(),
    VERCEL_REGION: zod_1.z.string().optional(), // Vercel部署区域
    // Supabase
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    SUPABASE_SERVICE_KEY: zod_1.z.string().min(1),
    // Redis - Vercel环境下可能需要调整
    REDIS_HOST: zod_1.z.string().optional(), // 在Vercel上可能是可选的
    REDIS_PORT: zod_1.z.string().default("6379"),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    REDIS_DB: zod_1.z.string().default("0"),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default("24h"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    // Rate Limiting - Vercel环境下可能需要调整
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default("900000"),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default("100"),
    // Logging - Vercel环境下简化日志
    LOG_LEVEL: zod_1.z.enum(["error", "warn", "info", "debug"]).default("info"),
    LOG_DIR: zod_1.z.string().default("./logs"),
});
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error("Environment validation failed:");
            const zodError = error;
            zodError.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
            });
        }
        else {
            console.error("Unknown error:", error);
        }
        process.exit(1);
    }
};
exports.env = parseEnv();
