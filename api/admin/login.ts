import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body as { email: string; password: string };
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_JWT_SECRET } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    return res.status(500).json({ error: 'Admin credentials not configured' });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin', email }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
}
