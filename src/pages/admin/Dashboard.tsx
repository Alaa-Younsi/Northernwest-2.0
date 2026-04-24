import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Package, ShoppingBag, DollarSign, Clock, Plus, Globe, Users, Activity } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { Order } from '@/types';

const STATUS_BADGE_MAP: Record<Order['status'], 'yellow' | 'blue' | 'purple' | 'green' | 'red'> = {
  pending: 'yellow',
  confirmed: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  confirmed: '#3B82F6',
  shipped: '#A855F7',
  delivered: '#22C55E',
  cancelled: '#FF0000',
};

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1a] rounded-sm ${className}`} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading } = useAdminDashboard();

  const [visitStats, setVisitStats] = useState<{
    uniqueToday: number;
    uniqueTotal: number;
    totalVisits: number;
    topPages: Array<{ page: string; count: number }>;
  } | null>(null);
  const [visitsLoading, setVisitsLoading] = useState(true);

  useEffect(() => {
    api.admin.visits.getStats()
      .then(setVisitStats)
      .catch(() => {})
      .finally(() => setVisitsLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Orders',
      value: data?.total_orders ?? 0,
      icon: ShoppingBag,
      color: 'text-white',
    },
    {
      label: 'Pending Orders',
      value: data?.pending_orders ?? 0,
      icon: Clock,
      color: 'text-yellow-400',
    },
    {
      label: 'Active Products',
      value: data?.total_products ?? 0,
      icon: Package,
      color: 'text-blue-400',
    },
    {
      label: 'Total Revenue',
      value: `$${(data?.revenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-[#FF0000]',
    },
  ];

  const ordersByStatus = data?.orders_by_status ?? {};
  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="font-display font-black text-white uppercase text-2xl sm:text-3xl tracking-widest border-l-2 border-[#FF0000] pl-4">
          DASHBOARD
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-1.5 font-mono text-xs text-[#FF0000] border border-[#FF0000] px-3 py-2 hover:bg-[#FF0000] hover:text-black transition-colors whitespace-nowrap"
          >
            <Plus size={11} /> ADD PRODUCT
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="font-mono text-xs text-[#888888] border border-[#1a1a1a] px-3 py-2 hover:text-white hover:border-[#888888] transition-colors whitespace-nowrap"
          >
            VIEW ALL ORDERS →
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {stats.map((card) => (
          <motion.div
            key={card.label}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 relative overflow-hidden"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,0,0,0.03) 24px,rgba(255,0,0,0.03) 25px)' }}
          >
            <card.icon size={14} className="text-[#333] absolute top-4 right-4" />
            <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">{card.label}</p>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <p className={`font-display font-black text-3xl ${card.color}`}>{card.value}</p>
            )}
            <TrendingUp size={10} className="text-[#333] mt-2" />
          </motion.div>
        ))}
      </motion.div>

      {/* Orders by Status */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm mb-4 border-l-2 border-[#FF0000] pl-3">
          ORDERS BY STATUS
        </h2>
        {loading ? (
          <Skeleton className="h-4 w-full mb-3" />
        ) : (
          <>
            <div className="flex h-3 overflow-hidden mb-4 rounded-sm">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div
                  key={status}
                  style={{ width: `${(count / totalOrders) * 100}%`, backgroundColor: STATUS_COLORS[status] ?? '#888' }}
                  title={`${status}: ${count}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] ?? '#888' }} />
                  <span className="font-mono text-xs text-[#888888] uppercase">{status}</span>
                  <span className="font-mono text-xs text-white">{count}</span>
                </div>
              ))}
              {Object.keys(ordersByStatus).length === 0 && (
                <p className="font-mono text-xs text-[#444]">No orders yet</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Top Products */}
      {(loading || (data?.top_products?.length ?? 0) > 0) && (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a]">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm border-l-2 border-[#FF0000] pl-3">
              TOP PRODUCTS
            </h2>
          </div>
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['#', 'Product', 'Units Sold', 'Revenue'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[#888888] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-[#1a1a1a]">
                    <td colSpan={4} className="px-6 py-3"><Skeleton className="h-4 w-full" /></td>
                  </tr>
                ))
              ) : (data?.top_products as Array<{ product_name_en: string; total_sold: number; revenue: number }> ?? []).map((p, i) => (
                <tr key={p.product_name_en} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                  <td className="px-6 py-3 text-[#FF0000] font-bold">{i + 1}</td>
                  <td className="px-6 py-3 text-white">{p.product_name_en}</td>
                  <td className="px-6 py-3 text-[#888888]">{p.total_sold}</td>
                  <td className="px-6 py-3 text-[#FF0000]">${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a]">
        <div className="px-6 py-4 border-b border-[#1a1a1a]">
          <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm border-l-2 border-[#FF0000] pl-3">
            RECENT ORDERS
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['Order #', 'Customer', 'Date', 'Status', 'Total'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[#888888] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-[#1a1a1a]">
                    <td colSpan={5} className="px-6 py-3"><Skeleton className="h-4 w-full" /></td>
                  </tr>
                ))
              ) : (data?.recent_orders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#444]">No orders yet</td>
                </tr>
              ) : (data?.recent_orders ?? []).map((order: Order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                  onClick={() => navigate('/admin/orders')}
                >
                  <td className="px-6 py-3 text-[#FF0000] font-bold">{order.order_number}</td>
                  <td className="px-6 py-3 text-white">{order.customer_name}</td>
                  <td className="px-6 py-3 text-[#888888]">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <Badge variant={STATUS_BADGE_MAP[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-white">${order.total_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h2 className="font-display font-bold text-white uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
          <Globe size={14} className="text-[#FF0000]" />
          ANALYTICS
        </h2>

        {/* Visit stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Unique Visitors Today',
              value: visitStats?.uniqueToday ?? 0,
              icon: Users,
            },
            {
              label: 'Total Unique Visitors',
              value: visitStats?.uniqueTotal ?? 0,
              icon: Globe,
            },
            {
              label: 'Total Page Views',
              value: visitStats?.totalVisits ?? 0,
              icon: Activity,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d0d] border border-[#1a1a1a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className="text-[#FF0000]" />
                <p className="font-mono text-xs text-[#888888] uppercase tracking-widest">{stat.label}</p>
              </div>
              {visitsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="font-display font-black text-white text-2xl">{stat.value.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>

        {/* Top pages */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h3 className="font-display font-bold text-white uppercase tracking-widest text-xs">Top Pages</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-[#111]">
                <th className="px-6 py-3 text-left font-mono text-xs text-[#555] uppercase tracking-widest">Page</th>
                <th className="px-6 py-3 text-left font-mono text-xs text-[#555] uppercase tracking-widest">Views</th>
              </tr>
            </thead>
            <tbody>
              {visitsLoading ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-[#444] font-mono text-xs">Loading...</td></tr>
              ) : !visitStats || visitStats.topPages.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-[#444] font-mono text-xs">No data yet</td></tr>
              ) : visitStats.topPages.map(({ page, count }) => (
                <tr key={page} className="border-b border-[#1a1a1a]">
                  <td className="px-6 py-3 font-mono text-xs text-white">{page}</td>
                  <td className="px-6 py-3 font-mono text-xs text-[#888888]">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
