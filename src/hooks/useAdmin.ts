import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export function useAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<{
    total_orders: number;
    pending_orders: number;
    total_products: number;
    revenue: number;
  } | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.admin.products
      .getAll()
      .then(setProducts)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load')
      )
      .finally(() => setLoading(false));
  };

  const fetchDashboard = () => {
    api.admin.dashboard().then(setDashboard).catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
    fetchDashboard();
  }, []);

  const createProduct = async (data: unknown) => {
    const product = await api.admin.products.create(data);
    fetchProducts();
    return product;
  };

  const updateProduct = async (id: string, data: unknown) => {
    const product = await api.admin.products.update(id, data);
    fetchProducts();
    return product;
  };

  const deleteProduct = async (id: string) => {
    await api.admin.products.delete(id);
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    dashboard,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
