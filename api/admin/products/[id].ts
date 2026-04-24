import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../_lib/supabase.js';
import { requireAdmin } from '../../../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  const { id } = req.query as { id: string };

  if (req.method === 'PATCH') {
    const { variants, ...productData } = req.body as {
      variants?: unknown[];
      [key: string]: unknown;
    };

    const { data: product, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    if (variants !== undefined) {
      await supabase.from('product_variants').delete().eq('product_id', id);
      if (variants.length) {
        await supabase
          .from('product_variants')
          .insert(
            (variants as Array<Record<string, unknown>>).map((v) => ({ ...v, product_id: id }))
          );
      }
    }

    return res.json(product);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
