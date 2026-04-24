import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  try {
    jwt.verify(auth.slice(7), process.env.ADMIN_JWT_SECRET!);
    return true;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}
