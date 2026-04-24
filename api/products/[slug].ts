import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

const PRODUCT_SELECT = `*, category:categories(*), variants:product_variants(*)`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query as { slug: string };

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return res.status(404).json({ error: 'Not found' });
  return res.json(data);
}
