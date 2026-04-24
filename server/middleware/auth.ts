import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    (req as Request & { admin: unknown }).admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
