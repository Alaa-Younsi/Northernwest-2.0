import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_JWT_SECRET } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    return res.status(500).json({ error: 'Admin credentials not configured' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin', username }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token });
});

// All routes below require admin token
router.use(verifyAdminToken);

// Dashboard stats
router.get('/dashboard', async (_req, res) => {
  const [
    { count: total_orders },
    { count: pending_orders },
    { count: total_products },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
  ]);

  const revenue = (revenueData ?? []).reduce((s: number, o: { total_amount: number }) => s + o.total_amount, 0);

  return res.json({ total_orders, pending_orders, total_products, revenue });
});

// Products
router.get('/products', async (_req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), variants:product_variants(*)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/products', async (req, res) => {
  const { variants, ...productData } = req.body as { variants: unknown[]; [key: string]: unknown };

  // Auto-generate slug
  if (!productData.slug && productData.name_en) {
    productData.slug = String(productData.name_en)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (variants?.length) {
    await supabase.from('product_variants').insert(
      (variants as Array<Record<string, unknown>>).map((v) => ({ ...v, product_id: product.id }))
    );
  }

  return res.status(201).json(product);
});

router.patch('/products/:id', async (req, res) => {
  const { variants, ...productData } = req.body as { variants: unknown[]; [key: string]: unknown };

  const { data: product, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (variants) {
    // Delete old variants and re-insert
    await supabase.from('product_variants').delete().eq('product_id', req.params.id);
    if (variants.length) {
      await supabase.from('product_variants').insert(
        (variants as Array<Record<string, unknown>>).map((v) => ({ ...v, product_id: req.params.id }))
      );
    }
  }

  return res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// Orders
router.get('/orders', async (_req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body as { status: string };
  const VALID = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;
