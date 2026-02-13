import express from 'express';
import { express as expressVercel } from '@vercel/express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

import { env } from '../src/config/env';
import { createSupabaseClient } from '../src/config/database';
import { createRedisClient } from '../src/config/redis';
import { requestId } from '../src/middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from '../src/middlewares/error.middleware';
import { rateLimiter } from '../src/middlewares/rate-limit.middleware';
import routes from '../src/routes';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestId);
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(env.API_PREFIX, routes);
app.use(notFoundHandler);
app.use(errorHandler);

createSupabaseClient();
createRedisClient();

export default expressVercel(app);
