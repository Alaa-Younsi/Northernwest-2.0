import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    api.admin.orders
      .getAll()
      .then(({ data }) => setOrders(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.admin.orders.updateStatus(id, status);
    fetchOrders();
  };

  return { orders, loading, error, updateStatus, refetch: fetchOrders };
}
