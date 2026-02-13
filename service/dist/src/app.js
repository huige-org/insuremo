"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Handle Vercel serverless environment
const isVercel = !!process.env.VERCEL;
// Initialize connections - 在Vercel环境下延迟初始化
if (!isVercel) {
    (0, database_1.createSupabaseClient)();
    (0, redis_1.createRedisClient)();
}
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                ...(process.env.VERCEL_URL
                    ? [`https://${process.env.VERCEL_URL}`]
                    : []),
            ],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: env_1.env.NODE_ENV === "production"
        ? [
            ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
            ...(process.env.VERCEL_URL
                ? [`https://${process.env.VERCEL_URL}`]
                : []),
        ]
        : true,
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Compression
app.use((0, compression_1.default)());
// Request ID
app.use(logger_middleware_1.requestId);
// Request logging
app.use(logger_middleware_1.requestLogger);
// Rate limiting
app.use(rate_limit_middleware_1.rateLimiter);
// Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Insure Admin API",
            version: "1.0.0",
            description: "Node.js + Supabase + Redis Backend Service API",
            contact: {
                name: "API Support",
                email: "support@example.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.env.PORT}${env_1.env.API_PREFIX}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Insure Admin API Docs",
}));
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
        version: '1.0.0',
        vercel: !!process.env.VERCEL,
    });
});
// Simple test endpoint
app.get('/test', (_req, res) => {
    res.status(200).json({
        message: 'Vercel deployment test successful',
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use(env_1.env.API_PREFIX, routes_1.default);
// 404 handler
app.use(error_middleware_1.notFoundHandler);
// Error handler
app.use(error_middleware_1.errorHandler);
// Start server - Vercel环境下不启动独立服务器
if (!isVercel) {
    const PORT = parseInt(env_1.env.PORT, 10);
    const server = app.listen(PORT, () => {
        logger_1.logger.info(`Server running on port ${PORT} in ${env_1.env.NODE_ENV} mode`);
        logger_1.logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger_1.logger.info(`${signal} received. Starting graceful shutdown...`);
        server.close(async () => {
            try {
                await (0, database_1.closeSupabaseConnection)();
                await (0, redis_1.closeRedisConnection)();
                logger_1.logger.info("All connections closed successfully");
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error("Error during shutdown:", error);
                process.exit(1);
            }
        });
        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger_1.logger.error("Forced shutdown due to timeout");
            process.exit(1);
        }, 30000);
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
        logger_1.logger.error("Uncaught Exception:", error);
        gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
    process.on("unhandledRejection", (reason, promise) => {
        logger_1.logger.error("Unhandled Rejection at:", promise, "reason:", reason);
        gracefulShutdown("UNHANDLED_REJECTION");
    });
}
else {
    logger_1.logger.info("Running in Vercel environment");
    // 在Vercel环境下，连接将在首次请求时建立
}
exports.default = app;
if (process.env.VERCEL) {
    module.exports = app;
    exports.handler = app;
}
