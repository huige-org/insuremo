import { createServer, Server } from 'http';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

import { env } from './src/config/env';
import { logger } from './src/config/logger';
import { createSupabaseClient, closeSupabaseConnection } from './src/config/database';
import { createRedisClient, closeRedisConnection } from './src/config/redis';
import { requestLogger, requestId } from './src/middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware';
import { rateLimiter } from './src/middlewares/rate-limit.middleware';
import routes from './src/routes';

const app: Application = express();

createSupabaseClient();
createRedisClient();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3001"],
    },
  },
}));
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(requestId);
app.use(requestLogger);
app.use(rateLimiter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insure Admin API',
      version: '1.0.0',
      description: 'Node.js + Supabase + Redis Backend Service API',
    },
    servers: [
      {
        url: `https://${env.VERCEL_URL || 'localhost'}${env.API_PREFIX}`,
        description: 'Vercel server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Insure Admin API Docs',
}));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

app.use(env.API_PREFIX, routes);
app.use(notFoundHandler);
app.use(errorHandler);

let server: Server | null = null;

if (env.NODE_ENV !== 'production') {
  const PORT = parseInt(env.PORT, 10);
  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

export default app;
