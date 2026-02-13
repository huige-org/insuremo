import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { validationErrorResponse } from './response';

interface CustomRequest extends Request {
  body: any;
  query: any;
  params: any;
}

export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });

      validationErrorResponse(res, 'Validation failed', errors);
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });

      validationErrorResponse(res, 'Query validation failed', errors);
      return;
    }

    req.query = result.data as any;
    next();
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });

      validationErrorResponse(res, 'Params validation failed', errors);
      return;
    }

    req.params = result.data as unknown as Record<string, string>;
    next();
  };
};

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const uuidSchema = z.string().uuid('Invalid UUID format');
