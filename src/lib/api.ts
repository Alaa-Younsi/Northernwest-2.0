import { supabase } from '@/lib/supabase';
import type { CartItem, Category, Product, Order, OrderItem } from '@/types';

// Suppress unused import warning
type _CartItemRef = CartItem;
type _OrderItemRef = OrderItem;

// ── helpers ──────────────────────────────────────────────────────────────────
const PRODUCT_SELECT = `*, category:categories(*), variants:product_variants(*)`;

// ── Visitor ID (anonymous analytics) ─────────────────────────────────────────
function getVisitorId(): string {
  let id = localStorage.getItem('nw_visitor_id');
  if (!id) {
    id = `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('nw_visitor_id', id);
  }
  return id;
}

function getSession() {
  // Returns the Supabase access token for the logged-in admin
  return supabase.auth.getSession().then(({ data }) => data.session?.access_token ?? null);
}

// ── Public API ────────────────────────────────────────────────────────────────
export const api = {
  categories: {
    getAll: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('name_en', { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    getBySlug: async (slug: string): Promise<Category> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  },

  products: {
    getAll: async (params?: {
      category?: string;
      sort?: string;
      order?: string;
      page?: number;
      limit?: number;
    }): Promise<{ data: Product[]; count: number; page: number; limit: number }> => {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .eq('is_active', true)
        .range(from, to);

      if (params?.category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', params.category)
          .single();
        if (cat) query = query.eq('category_id', cat.id);
      }

      const sortCol = params?.sort === 'price' ? 'base_price' : 'created_at';
      const ascending = params?.order === 'asc';
      query = query.order(sortCol, { ascending });

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);
      return { data: (data as Product[]) ?? [], count: count ?? 0, page, limit };
    },

    getFeatured: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_featured', true)
        .eq('is_active', true);
      if (error) throw new Error(error.message);

      const featured = (data as Product[]) ?? [];
      if (featured.length >= 4) return featured.slice(0, 4);

      // Supplement with newest active products if fewer than 4 are featured
      const featuredIds = featured.map((p) => p.id);
      const { data: newest } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      const supplemental = ((newest as Product[]) ?? [])
        .filter((p) => !featuredIds.includes(p.id));

      return [...featured, ...supplemental].slice(0, 4);
    },

    getByCategory: async (slug: string): Promise<Product[]> => {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!cat) return [];
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('category_id', cat.id)
        .eq('is_active', true);
      if (error) throw new Error(error.message);
      return (data as Product[]) ?? [];
    },

    getBySlug: async (slug: string): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('slug', slug)
        .single();
      if (error) throw new Error(error.message);
      return data as Product;
    },
  },

  orders: {
    create: async (orderData: {
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      country: string;
      city: string;
      address_line1: string;
      address_line2?: string;
      zip_code?: string;
      notes?: string;
      items: Array<{ variant_id: string; quantity: number }>;
    }): Promise<{ order_number: string; id: string }> => {
      const { items, ...orderFields } = orderData;

      // Calculate total from variants
      const variantIds = items.map((i) => i.variant_id);
      const { data: variants, error: varErr } = await supabase
        .from('product_variants')
        .select('id, price_modifier, products(base_price)')
        .in('id', variantIds);
      if (varErr) throw new Error(varErr.message);

      const priceMap: Record<string, number> = {};
      for (const v of variants ?? []) {
        const base = (v as any).products?.base_price ?? 0;
        priceMap[v.id] = base + v.price_modifier;
      }

      const total_amount = items.reduce(
        (sum, i) => sum + (priceMap[i.variant_id] ?? 0) * i.quantity,
        0
      );

      const orderNumber = `NW-${Date.now()}`;
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ ...orderFields, order_number: orderNumber, total_amount, status: 'pending' })
        .select('id, order_number')
        .single();
      if (orderErr) throw new Error(orderErr.message);

      const orderItems = items.map((i) => ({
        order_id: order.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: priceMap[i.variant_id] ?? 0,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw new Error(itemsErr.message);

      return { id: order.id, order_number: order.order_number };
    },
  },

  // ── Contact messages ──────────────────────────────────────────────────────
  messages: {
    create: async (data: { name: string; email: string; message: string }): Promise<void> => {
      const { error } = await supabase.from('messages').insert(data);
      if (error) throw new Error(error.message);
    },
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  newsletter: {
    subscribe: async (email: string): Promise<void> => {
      const { error } = await supabase.from('newsletter_subscriptions').insert({ email });
      // Ignore duplicate email (23505 = unique_violation)
      if (error && error.code !== '23505') throw new Error(error.message);
    },
  },

  // ── Page visit tracking ───────────────────────────────────────────────────
  visits: {
    track: async (page: string): Promise<void> => {
      try {
        const visitor_id = getVisitorId();
        await supabase.from('page_visits').insert({ visitor_id, page });
      } catch {
        // Non-critical — fail silently
      }
    },
  },

  // ── Admin API (requires Supabase Auth session) ────────────────────────────
  admin: {
    login: async (email: string, password: string): Promise<{ token: string }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      return { token: data.session?.access_token ?? '' };
    },

    logout: async () => {
      await supabase.auth.signOut();
    },

    dashboard: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('id, status, total_amount, created_at, customer_name, customer_email, order_number').order('created_at', { ascending: false }),
        supabase.from('products').select('id'),
      ]);

      const orders: Order[] = (ordersRes.data ?? []) as Order[];
      const total_orders = orders.length;
      const pending_orders = orders.filter((o) => o.status === 'pending').length;
      const total_products = productsRes.data?.length ?? 0;
      const revenue = orders.reduce((s, o) => s + (o.total_amount ?? 0), 0);

      const orders_by_status: Record<string, number> = {};
      for (const o of orders) {
        orders_by_status[o.status] = (orders_by_status[o.status] ?? 0) + 1;
      }

      const recent_orders = orders.slice(0, 5);

      return { total_orders, pending_orders, total_products, revenue, orders_by_status, recent_orders, top_products: [] };
    },

    products: {
      getAll: async (): Promise<Product[]> => {
        const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data as Product[]) ?? [];
      },
      create: async (productData: unknown): Promise<Product> => {
        const { variants, category, slug: _slug, ...fields } = productData as any;
        // Generate slug from English name if not provided
        const slug = (_slug as string) || (fields.name_en as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data, error } = await supabase
          .from('products')
          .insert({ ...fields, slug })
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        // Insert variants into product_variants table
        if (variants?.length) {
          const variantRows = (variants as any[]).map(({ id: _id, ...v }: any) => ({
            ...v,
            product_id: data.id,
          }));
          const { error: vErr } = await supabase.from('product_variants').insert(variantRows);
          if (vErr) throw new Error(vErr.message);
        }
        // Fetch full product with relations
        const { data: full, error: fetchErr } = await supabase
          .from('products')
          .select(PRODUCT_SELECT)
          .eq('id', data.id)
          .single();
        if (fetchErr) throw new Error(fetchErr.message);
        return full as Product;
      },
      update: async (id: string, productData: unknown): Promise<Product> => {
        const { variants, category, ...fields } = productData as any;
        const { data, error } = await supabase
          .from('products')
          .update(fields)
          .eq('id', id)
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        // Replace variants: delete old ones, insert new ones
        if (variants !== undefined) {
          await supabase.from('product_variants').delete().eq('product_id', id);
          if (variants.length) {
            const variantRows = (variants as any[]).map(({ id: _id, ...v }: any) => ({
              ...v,
              product_id: id,
            }));
            const { error: vErr } = await supabase.from('product_variants').insert(variantRows);
            if (vErr) throw new Error(vErr.message);
          }
        }
        // Fetch full product with relations
        const { data: full, error: fetchErr } = await supabase
          .from('products')
          .select(PRODUCT_SELECT)
          .eq('id', id)
          .single();
        if (fetchErr) throw new Error(fetchErr.message);
        return full as Product;
      },
      delete: async (id: string): Promise<{ success: boolean }> => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
      },
    },

    orders: {
      getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Order[]; count: number }> => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
          .from('orders')
          .select('*, items:order_items(*)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        if (params?.status) query = query.eq('status', params.status);
        const { data, error, count } = await query;
        if (error) throw new Error(error.message);
        return { data: (data as Order[]) ?? [], count: count ?? 0 };
      },
      getById: async (id: string): Promise<Order> => {
        const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('id', id).single();
        if (error) throw new Error(error.message);
        return data as Order;
      },
      updateStatus: async (id: string, status: string): Promise<Order> => {
        const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select('*, items:order_items(*)').single();
        if (error) throw new Error(error.message);
        return data as Order;
      },
      addNote: async (id: string, note: string): Promise<Order> => {
        const { data, error } = await supabase.from('orders').update({ admin_note: note }).eq('id', id).select('*, items:order_items(*)').single();
        if (error) throw new Error(error.message);
        return data as Order;
      },
    },

    categories: {
      getAll: async (): Promise<Category[]> => {
        const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('name_en', { ascending: true });
        if (error) throw new Error(error.message);
        return data ?? [];
      },
      create: async (categoryData: unknown): Promise<Category> => {
        const { data, error } = await supabase.from('categories').insert(categoryData as any).select('*').single();
        if (error) throw new Error(error.message);
        return data;
      },
      update: async (id: string, categoryData: unknown): Promise<Category> => {
        const { data, error } = await supabase.from('categories').update(categoryData as any).eq('id', id).select('*').single();
        if (error) throw new Error(error.message);
        return data;
      },
      delete: async (id: string): Promise<{ success: boolean }> => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
      },
    },

    messages: {
      getAll: async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data ?? [];
      },
      markRead: async (id: string): Promise<void> => {
        const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id);
        if (error) throw new Error(error.message);
      },
      delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (error) throw new Error(error.message);
      },
    },

    newsletter: {
      getAll: async () => {
        const { data, error } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
          .order('subscribed_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data ?? [];
      },
      delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('newsletter_subscriptions').delete().eq('id', id);
        if (error) throw new Error(error.message);
      },
    },

    visits: {
      getStats: async () => {
        const today = new Date().toISOString().split('T')[0];
        const [allRes, todayRes] = await Promise.all([
          supabase.from('page_visits').select('visitor_id, page, visited_at'),
          supabase.from('page_visits').select('visitor_id').gte('visited_at', `${today}T00:00:00`),
        ]);
        const all = (allRes.data ?? []) as Array<{ visitor_id: string; page: string; visited_at: string }>;
        const todayData = (todayRes.data ?? []) as Array<{ visitor_id: string }>;
        const uniqueTotal = new Set(all.map((v) => v.visitor_id)).size;
        const uniqueToday = new Set(todayData.map((v) => v.visitor_id)).size;
        const pageCount: Record<string, number> = {};
        for (const v of all) {
          pageCount[v.page] = (pageCount[v.page] ?? 0) + 1;
        }
        const topPages = Object.entries(pageCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([page, count]) => ({ page, count }));
        return { uniqueTotal, uniqueToday, topPages, totalVisits: all.length };
      },
    },
  },
};

// Keep getSession exported in case any component needs the raw token
export { getSession };

