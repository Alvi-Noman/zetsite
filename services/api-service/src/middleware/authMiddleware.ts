import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@zetsite/config/validateEnv';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    storeId: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      storeId?: string;
    };

    if (!payload.storeId) {
      res.status(401).json({ success: false, message: 'Unauthorized: No store on account' });
      return;
    }

    req.user = { id: payload.id, email: payload.email, storeId: payload.storeId };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
}
