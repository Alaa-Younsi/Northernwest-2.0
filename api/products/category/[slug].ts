import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../_lib/supabase.js';

const PRODUCT_SELECT = `*, category:categories(*), variants:product_variants(*)`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query as { slug: string };

  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (catErr) return res.status(404).json({ error: 'Category not found' });

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', cat.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
