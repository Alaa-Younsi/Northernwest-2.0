import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product, Order, Category } from '@/types';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.admin.products.getAll()
      .then(setProducts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    products, loading, error, refetch: fetch,
    createProduct: async (data: unknown) => { await api.admin.products.create(data); fetch(); },
    updateProduct: async (id: string, data: unknown) => { await api.admin.products.update(id, data); fetch(); },
    deleteProduct: async (id: string) => { await api.admin.products.delete(id); fetch(); },
  };
}

export function useAdminOrders(status?: string, page = 1, limit = 20) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.admin.orders.getAll({ status, page, limit })
      .then(({ data, count: c }) => { setOrders(data); setCount(c ?? 0); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [status, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    orders, count, loading, error, refetch: fetch,
    updateStatus: async (id: string, newStatus: string) => { await api.admin.orders.updateStatus(id, newStatus); fetch(); },
  };
}

export function useAdminDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.admin.dashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    api.admin.categories.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    categories, loading, refetch: fetch,
    createCategory: async (data: unknown) => { await api.admin.categories.create(data); fetch(); },
    updateCategory: async (id: string, data: unknown) => { await api.admin.categories.update(id, data); fetch(); },
    deleteCategory: async (id: string) => { await api.admin.categories.delete(id); fetch(); },
  };
}

// Legacy compat \u2014 used by ProductsManager
export function useAdmin() {
  const p = useAdminProducts();
  const d = useAdminDashboard();
  return { ...p, dashboard: d.data };
}
