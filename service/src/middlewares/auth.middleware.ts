import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getSupabaseClient } from '../config/database';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response';
import { JwtPayload } from '../models/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name?: string;
        avatar_url?: string;
        phone?: string;
        roles: string[];
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorizedResponse(res, 'Access token is required');
      return;
    }

    const token = authHeader.substring(7);

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      unauthorizedResponse(res, 'Invalid or expired token');
      return;
    }

    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, status')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      unauthorizedResponse(res, 'User not found');
      return;
    }

    if (user.status === 'banned') {
      forbiddenResponse(res, 'Account has been banned');
      return;
    }

    if (user.status === 'inactive') {
      forbiddenResponse(res, 'Account is inactive');
      return;
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role:roles(code)')
      .eq('user_id', user.id);

    const roles = (userRoles as any[] || [])
      .map((ur: any) => ur.role?.code)
      .filter((code: string | undefined): code is string => Boolean(code));

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      roles,
    };

    next();
  } catch (error) {
    unauthorizedResponse(res, 'Authentication failed');
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res, 'Authentication required');
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      forbiddenResponse(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      const supabase = getSupabaseClient();
      const { data: user } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', decoded.userId)
        .single();

      if (user) {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role:roles(code)')
          .eq('user_id', user.id);

        const roles = (userRoles as any[] || [])
          .map((ur: any) => ur.role?.code)
          .filter((code: string | undefined): code is string => Boolean(code));

        req.user = {
          id: user.id,
          email: user.email,
          roles,
        };
      }
    } catch {
      // Token invalid, but we continue without user
    }

    next();
  } catch (error) {
    next();
  }
};
