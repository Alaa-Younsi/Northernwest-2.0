import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

const PRODUCT_SELECT = `*, category:categories(*), variants:product_variants(*)`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    sort = 'created_at',
    order = 'desc',
  } = req.query as Record<string, string>;

  const from = (parseInt(page) - 1) * parseInt(limit);
  const to = from + parseInt(limit) - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', true)
    .order(sort, { ascending: order === 'asc' })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data, count, page: parseInt(page), limit: parseInt(limit) });
}
