import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import type { Order } from '@/types';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    total_products: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.admin.dashboard(),
      api.admin.orders.getAll(),
    ]).then(([dash, orders]) => {
      setStats(dash);
      setRecentOrders(orders.slice(0, 10));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: Order['status']) => {
    const map = {
      pending: 'yellow',
      confirmed: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    } as const;
    return <Badge variant={map[status]}>{status}</Badge>;
  };

  const STAT_CARDS = [
    { label: t('admin.totalOrders'), value: stats.total_orders, color: 'text-white' },
    { label: t('admin.pendingOrders'), value: stats.pending_orders, color: 'text-yellow-400' },
    { label: t('admin.totalProducts'), value: stats.total_products, color: 'text-blue-400' },
    { label: t('admin.totalRevenue'), value: `$${stats.revenue.toFixed(2)}`, color: 'text-[#FF0000]' },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display font-black text-white uppercase text-3xl tracking-widest">
          {t('admin.dashboard')}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-[#0d0d0d] border border-[#1a1a1a] p-6"
          >
            <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
              {card.label}
            </p>
            <p className={`font-display font-black text-3xl ${card.color}`}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-4 mb-10">
        <Link
          to="/admin/products"
          className="font-mono text-xs text-[#FF0000] border border-[#FF0000] px-4 py-2 hover:bg-[#FF0000] hover:text-black transition-colors"
        >
          + {t('admin.addProduct')}
        </Link>
        <Link
          to="/admin/orders"
          className="font-mono text-xs text-[#888888] border border-[#1a1a1a] px-4 py-2 hover:text-white hover:border-[#888888] transition-colors"
        >
          {t('admin.orders')} →
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-xl mb-4">
          {t('admin.recentOrders')}
        </h2>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Order #', 'Customer', 'Date', 'Status', 'Total'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-[#888888] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="px-4 py-3 text-[#FF0000]">{order.order_number}</td>
                  <td className="px-4 py-3 text-white">{order.customer_name}</td>
                  <td className="px-4 py-3 text-[#888888]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{statusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-white">${order.total_amount.toFixed(2)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#888888]">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
