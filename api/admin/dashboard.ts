import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase.js';
import { requireAdmin } from '../../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

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

  const revenue = (revenueData ?? []).reduce(
    (s: number, o: { total_amount: number }) => s + o.total_amount,
    0
  );

  return res.json({ total_orders, pending_orders, total_products, revenue });
}
