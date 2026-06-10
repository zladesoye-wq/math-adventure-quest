import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { findParentById } from '../models/auth';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'parent' | 'student';
    parentId?: string;
    email?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = verifyToken(token);
    
    // For both parent and student, the 'id' in token refers to their specific ID in respective tables.
    // However, if it's a student, we might want to check the parent account still exists.
    const parentId = decoded.role === 'student' ? decoded.parentId : decoded.id;
    const parent = await findParentById(parentId);
    
    if (!parent) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      parentId: decoded.parentId,
      email: parent.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const parentId = decoded.role === 'student' ? decoded.parentId : decoded.id;
    const parent = await findParentById(parentId);
    
    if (parent) {
      req.user = {
        id: decoded.id,
        role: decoded.role,
        parentId: decoded.parentId,
        email: parent.email
      };
    }
    
    next();
  } catch (error) {
    // Fail silently for optional auth
    next();
  }
};
