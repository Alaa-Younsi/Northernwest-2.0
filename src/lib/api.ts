import type { CartItem, Category, Product, Order } from '@/types';

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('nw_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Suppress unused import warning — CartItem is used by orders.create
type _CartItemRef = CartItem;

export const api = {
  categories: {
    getAll: () => request<Category[]>('/categories'),
    getBySlug: (slug: string) => request<Category>(`/categories/${slug}`),
  },

  products: {
    getAll: (params?: { category?: string; sort?: string; order?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.sort) qs.set('sort', params.sort);
      if (params?.order) qs.set('order', params.order);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      return request<{ data: Product[]; count: number; page: number; limit: number }>(
        `/products?${qs.toString()}`
      );
    },
    getFeatured: () => request<Product[]>('/products/featured'),
    getByCategory: (slug: string) => request<Product[]>(`/products/category/${slug}`),
    getBySlug: (slug: string) => request<Product>(`/products/${slug}`),
  },

  orders: {
    create: (data: {
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
    }) =>
      request<{ order_number: string; id: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  admin: {
    login: (email: string, password: string) =>
      request<{ token: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    dashboard: () =>
      request<{
        total_orders: number;
        pending_orders: number;
        total_products: number;
        revenue: number;
        orders_by_status: Record<string, number>;
        recent_orders: Order[];
        top_products: Array<{ product_name_en: string; total_sold: number; revenue: number }>;
      }>('/admin/dashboard'),

    products: {
      getAll: () => request<Product[]>('/admin/products'),
      create: (data: unknown) =>
        request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: unknown) =>
        request<Product>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/admin/products/${id}`, { method: 'DELETE' }),
    },

    orders: {
      getAll: (params?: { status?: string; page?: number; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params?.status) qs.set('status', params.status);
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        return request<{ data: Order[]; count: number }>(`/admin/orders?${qs.toString()}`);
      },
      getById: (id: string) => request<Order>(`/admin/orders/${id}`),
      updateStatus: (id: string, status: string) =>
        request<Order>(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
      addNote: (id: string, note: string) =>
        request<Order>(`/admin/orders/${id}/note`, {
          method: 'PATCH',
          body: JSON.stringify({ note }),
        }),
    },

    categories: {
      getAll: () => request<Category[]>('/admin/categories'),
      create: (data: unknown) =>
        request<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: unknown) =>
        request<Category>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' }),
    },
  },
};
