import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { env } from '@zetsite/config/validateEnv';
import { getDb } from '../utils/db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    store: { id: string; name: string; slug: string } | null;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
      return;
    }

    const store = user.storeId
      ? await db.collection('stores').findOne({ _id: user.storeId })
      : null;

    req.user = {
      id: user._id.toString(),
      email: user.email,
      store: store ? { id: store._id.toString(), name: store.name, slug: store.slug } : null,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
}
