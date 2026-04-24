import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../_lib/supabase.js';
import { requireAdmin } from '../../../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { variants, ...productData } = req.body as {
      variants: unknown[];
      [key: string]: unknown;
    };

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
      await supabase
        .from('product_variants')
        .insert(
          (variants as Array<Record<string, unknown>>).map((v) => ({
            ...v,
            product_id: product.id,
          }))
        );
    }

    return res.status(201).json(product);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
