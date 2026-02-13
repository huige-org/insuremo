import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env';
import path from 'path';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const isVercel = !!process.env.VERCEL;

// In Vercel, skip file logging entirely to avoid EROFS error
const enableFileLogging = !isVercel && env.NODE_ENV !== 'test';

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Only use file logging in non-Vercel environments
  if (enableFileLogging) {
    const logDir = path.resolve(env.LOG_DIR);
    try {
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        })
      );
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        })
      );
    } catch (error) {
      console.warn('File logging disabled:', error);
    }
  }

  // Always add console transport
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    })
  );

  return transports;
};

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'insure-admin-service',
    environment: env.NODE_ENV,
  },
  transports: createTransports(),
  exitOnError: false,
});

export const stream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};
