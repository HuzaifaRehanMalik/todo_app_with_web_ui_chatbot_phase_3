import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      error: 'Access denied. No token provided.'
    });
    return;
  }

  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET || '');
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Invalid or expired token.'
    });
  }
};
