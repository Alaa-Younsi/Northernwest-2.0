import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.get('/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', req.params.slug)
    .single();
  if (error) return res.status(404).json({ error: 'Not found' });
  return res.json(data);
});

export default router;
