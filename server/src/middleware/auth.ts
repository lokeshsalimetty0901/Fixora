import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fixora_super_secret_jwt_token_key_change_in_production_2026';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: Role };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access forbidden: Requires ${allowedRoles.join(' or ')} role` });
    }

    next();
  };
};
