import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variants:product_variants(*)
`;

router.get('/', async (req, res) => {
  const { page = '1', limit = '20', sort = 'created_at', order = 'desc' } = req.query as Record<string, string>;
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
});

router.get('/featured', async (_req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/category/:slug', async (req, res) => {
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', req.params.slug)
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
});

router.get('/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  return res.json(data);
});

export default router;
