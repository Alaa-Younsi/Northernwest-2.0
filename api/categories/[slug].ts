import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query as { slug: string };

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return res.status(404).json({ error: 'Not found' });
  return res.json(data);
}
