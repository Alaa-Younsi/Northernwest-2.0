import type { CartItem } from '@/types';

const BASE_URL = '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('nw_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ── Categories ─────────────────────────────────────────────────────────────
export const api = {
  categories: {
    getAll: () => request<import('@/types').Category[]>('/categories'),
    getBySlug: (slug: string) =>
      request<import('@/types').Category>(`/categories/${slug}`),
  },

  products: {
    getAll: (params?: { category?: string; sort?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.sort) qs.set('sort', params.sort);
      if (params?.page) qs.set('page', String(params.page));
      return request<{ products: import('@/types').Product[]; total: number }>(
        `/products?${qs.toString()}`
      );
    },
    getFeatured: () =>
      request<import('@/types').Product[]>('/products/featured'),
    getByCategory: (slug: string) =>
      request<import('@/types').Product[]>(`/products/category/${slug}`),
    getBySlug: (slug: string) =>
      request<import('@/types').Product>(`/products/${slug}`),
  },

  orders: {
    create: (data: {
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      shipping_address: string;
      shipping_city: string;
      shipping_country: string;
      shipping_zip?: string;
      notes?: string;
      items: CartItem[];
    }) =>
      request<{ order_number: string }>('/orders', {
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
      }>('/admin/dashboard'),

    products: {
      getAll: () => request<import('@/types').Product[]>('/admin/products'),
      create: (data: unknown) =>
        request<import('@/types').Product>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: unknown) =>
        request<import('@/types').Product>(`/admin/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/admin/products/${id}`, {
          method: 'DELETE',
        }),
    },

    orders: {
      getAll: () => request<import('@/types').Order[]>('/admin/orders'),
      updateStatus: (id: string, status: string) =>
        request<import('@/types').Order>(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
    },
  },
};
