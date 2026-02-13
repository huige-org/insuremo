import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

import { env } from "./config/env";
import { logger } from "./config/logger";
import {
  createSupabaseClient,
  closeSupabaseConnection,
} from "./config/database";
import { createRedisClient, closeRedisConnection } from "./config/redis";
import { requestLogger, requestId } from "./middlewares/logger.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { rateLimiter } from "./middlewares/rate-limit.middleware";
import routes from "./routes";

const app: Application = express();

const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  createSupabaseClient();
  createRedisClient();
}

app.use(
  helmet({
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
  })
);

app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? [
            ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
            ...(process.env.VERCEL_URL
              ? [`https://${process.env.VERCEL_URL}`]
              : []),
          ]
        : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(compression());

app.use(requestId);
app.use(requestLogger);
app.use(rateLimiter);

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
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
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

// Only enable Swagger in non-Vercel environment
if (!isVercel) {
  const specs = swaggerJsdoc(swaggerOptions);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Insure Admin API Docs",
    })
  );
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: "1.0.0",
    vercel: !!process.env.VERCEL,
  });
});

app.get("/test", (_req, res) => {
  res.status(200).json({
    message: "Vercel deployment test successful",
    timestamp: new Date().toISOString(),
  });
});

app.use(env.API_PREFIX, routes);

app.use(notFoundHandler);
app.use(errorHandler);

if (!isVercel) {
  const PORT = parseInt(env.PORT, 10);

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      try {
        await closeSupabaseConnection();
        await closeRedisConnection();
        logger.info("All connections closed successfully");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    gracefulShutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("UNHANDLED_REJECTION");
  });
} else {
  logger.info("Running in Vercel environment");
}

export default app;
