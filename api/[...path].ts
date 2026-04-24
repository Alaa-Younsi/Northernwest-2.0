import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Supabase ────────────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
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

const PRODUCT_SELECT = `*, category:categories(*), variants:product_variants(*)`;

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawPath = req.query.path;
  const segments: string[] = Array.isArray(rawPath)
    ? rawPath
    : typeof rawPath === 'string'
    ? rawPath.split('/').filter(Boolean)
    : [];
  const method = req.method ?? 'GET';
  const db = getSupabase();

  // ── GET /api/health ────────────────────────────────────────────────────────
  if (segments[0] === 'health') return res.json({ ok: true });

  // ── GET /api/debug — check env vars are set (safe, values not exposed) ────
  if (segments[0] === 'debug') {
    return res.json({
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      ADMIN_JWT_SECRET: !!process.env.ADMIN_JWT_SECRET,
    });
  }

  // ── /api/categories ────────────────────────────────────────────────────────
  if (segments[0] === 'categories') {
    // GET /api/categories
    if (segments.length === 1) {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    // GET /api/categories/:slug
    if (segments.length === 2) {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .eq('slug', segments[1])
        .single();
      if (error) return res.status(404).json({ error: 'Not found' });
      return res.json(data);
    }
  }

  // ── /api/products ──────────────────────────────────────────────────────────
  if (segments[0] === 'products') {
    // GET /api/products/featured  (must check before /:slug)
    if (segments.length === 2 && segments[1] === 'featured') {
      const { data, error } = await db
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    // GET /api/products/category/:slug
    if (segments.length === 3 && segments[1] === 'category') {
      const { data: cat, error: catErr } = await db
        .from('categories')
        .select('id')
        .eq('slug', segments[2])
        .single();
      if (catErr) return res.status(404).json({ error: 'Category not found' });

      const { data, error } = await db
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('category_id', cat.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    // GET /api/products
    if (segments.length === 1) {
      const {
        page = '1',
        limit = '20',
        sort = 'created_at',
        order = 'desc',
      } = req.query as Record<string, string>;
      const from = (parseInt(page) - 1) * parseInt(limit);
      const to = from + parseInt(limit) - 1;

      const { data, error, count } = await db
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .eq('is_active', true)
        .order(sort, { ascending: order === 'asc' })
        .range(from, to);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ data, count, page: parseInt(page), limit: parseInt(limit) });
    }

    // GET /api/products/:slug
    if (segments.length === 2) {
      const { data, error } = await db
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('slug', segments[1])
        .eq('is_active', true)
        .single();
      if (error) return res.status(404).json({ error: 'Not found' });
      return res.json(data);
    }
  }

  // ── POST /api/orders ───────────────────────────────────────────────────────
  if (segments[0] === 'orders' && segments.length === 1 && method === 'POST') {
    const {
      customer_name,
      customer_email,
      customer_phone,
      country,
      city,
      address_line1,
      address_line2,
      zip_code,
      items,
    } = req.body as {
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      country: string;
      city: string;
      address_line1: string;
      address_line2?: string;
      zip_code?: string;
      items: Array<{ variant_id: string; quantity: number }>;
    };

    if (!items?.length) return res.status(400).json({ error: 'No items provided' });

    const { data: variants, error: varErr } = await db
      .from('product_variants')
      .select('id, sku, stock, price_modifier, product:products(id, base_price, name_en)')
      .in('id', items.map((i) => i.variant_id));

    if (varErr || !variants) return res.status(500).json({ error: 'Failed to fetch variants' });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variant_id);
      if (!variant) return res.status(400).json({ error: `Variant ${item.variant_id} not found` });
      if ((variant.stock as number) < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${variant.sku}` });
      }
    }

    const orderItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variant_id)!;
      const product = variant.product as unknown as { id: string; base_price: number; name_en: string };
      const unit_price = product.base_price + ((variant.price_modifier as number) ?? 0);
      return { product_id: product.id, variant_id: item.variant_id, quantity: item.quantity, unit_price, product_name_en: product.name_en };
    });

    const total_amount = orderItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const order_number = `NW-${Date.now()}`;

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({ order_number, customer_name, customer_email, customer_phone, country, city, address_line1, address_line2, zip_code, total_amount, status: 'pending' })
      .select()
      .single();
    if (orderErr || !order) return res.status(500).json({ error: 'Failed to create order' });

    const { error: itemsErr } = await db
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) return res.status(500).json({ error: 'Failed to insert order items' });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variant_id)!;
      await db.from('product_variants').update({ stock: (variant.stock as number) - item.quantity }).eq('id', item.variant_id);
    }

    return res.status(201).json({ order_number: order.order_number, id: order.id });
  }

  // ── /api/admin ─────────────────────────────────────────────────────────────
  if (segments[0] === 'admin') {
    // POST /api/admin/login  (public — no auth check)
    if (segments[1] === 'login' && method === 'POST') {
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

    // All routes below require admin token
    if (!requireAdmin(req, res)) return;

    // GET /api/admin/dashboard
    if (segments[1] === 'dashboard') {
      const [
        { count: total_orders },
        { count: pending_orders },
        { count: total_products },
        { data: revenueData },
      ] = await Promise.all([
        db.from('orders').select('*', { count: 'exact', head: true }),
        db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        db.from('orders').select('total_amount').neq('status', 'cancelled'),
      ]);

      const revenue = (revenueData ?? []).reduce(
        (s: number, o: { total_amount: number }) => s + o.total_amount,
        0
      );
      return res.json({ total_orders, pending_orders, total_products, revenue });
    }

    // GET /api/admin/products  |  POST /api/admin/products
    if (segments[1] === 'products' && segments.length === 2) {
      if (method === 'GET') {
        const { data, error } = await db
          .from('products')
          .select('*, category:categories(*), variants:product_variants(*)')
          .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
      }
      if (method === 'POST') {
        const { variants, ...productData } = req.body as { variants: unknown[]; [k: string]: unknown };
        if (!productData.slug && productData.name_en) {
          productData.slug = String(productData.name_en).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { data: product, error } = await db.from('products').insert(productData).select().single();
        if (error) return res.status(500).json({ error: error.message });
        if (variants?.length) {
          await db.from('product_variants').insert(
            (variants as Array<Record<string, unknown>>).map((v) => ({ ...v, product_id: product.id }))
          );
        }
        return res.status(201).json(product);
      }
    }

    // PATCH /api/admin/products/:id  |  DELETE /api/admin/products/:id
    if (segments[1] === 'products' && segments.length === 3) {
      const id = segments[2];
      if (method === 'PATCH') {
        const { variants, ...productData } = req.body as { variants?: unknown[]; [k: string]: unknown };
        const { data: product, error } = await db.from('products').update(productData).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        if (variants !== undefined) {
          await db.from('product_variants').delete().eq('product_id', id);
          if (variants.length) {
            await db.from('product_variants').insert(
              (variants as Array<Record<string, unknown>>).map((v) => ({ ...v, product_id: id }))
            );
          }
        }
        return res.json(product);
      }
      if (method === 'DELETE') {
        const { error } = await db.from('products').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
      }
    }

    // GET /api/admin/orders
    if (segments[1] === 'orders' && segments.length === 2) {
      const { data, error } = await db
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    // PATCH /api/admin/orders/:id/status
    if (segments[1] === 'orders' && segments.length === 4 && segments[3] === 'status' && method === 'PATCH') {
      const { status } = req.body as { status: string };
      const VALID = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });

      const { data, error } = await db
        .from('orders')
        .update({ status })
        .eq('id', segments[2])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
