import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.post('/', async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    country,
    city,
    address_line1,
    address_line2,
    zip_code,
    items, // Array<{ variant_id: string, quantity: number }>
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

  if (!items?.length) {
    return res.status(400).json({ error: 'No items provided' });
  }

  // Fetch variants to compute prices server-side
  const variantIds = items.map((i) => i.variant_id);
  const { data: variants, error: varErr } = await supabase
    .from('product_variants')
    .select('id, sku, stock, price_modifier, product:products(id, base_price, name_en)')
    .in('id', variantIds);

  if (varErr || !variants) {
    return res.status(500).json({ error: 'Failed to fetch variants' });
  }

  // Validate stock
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variant_id);
    if (!variant) return res.status(400).json({ error: `Variant ${item.variant_id} not found` });
    if (variant.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${variant.sku}` });
    }
  }

  // Compute total
  const orderItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variant_id)!;
    const product = variant.product as { id: string; base_price: number; name_en: string };
    const unit_price = product.base_price + (variant.price_modifier ?? 0);
    return {
      product_id: product.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price,
      product_name_en: product.name_en,
    };
  });

  const total_amount = orderItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const order_number = `NW-${Date.now()}`;

  // Insert order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      country,
      city,
      address_line1,
      address_line2,
      zip_code,
      total_amount,
      status: 'pending',
    })
    .select()
    .single();

  if (orderErr || !order) {
    return res.status(500).json({ error: 'Failed to create order' });
  }

  // Insert order items
  const { error: itemsErr } = await supabase.from('order_items').insert(
    orderItems.map((i) => ({ ...i, order_id: order.id }))
  );

  if (itemsErr) {
    return res.status(500).json({ error: 'Failed to insert order items' });
  }

  // Decrement stock
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variant_id)!;
    await supabase
      .from('product_variants')
      .update({ stock: variant.stock - item.quantity })
      .eq('id', item.variant_id);
  }

  return res.status(201).json({ order_number: order.order_number, id: order.id });
});

export default router;
