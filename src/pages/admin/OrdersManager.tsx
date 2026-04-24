import { useState, useCallback } from 'react';
import { Eye, Download } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import OrderDetail from './OrderDetail';
import type { Order } from '@/types';

const STATUSES: Array<Order['status'] | 'all'> = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_BADGE_MAP: Record<Order['status'], 'yellow' | 'blue' | 'purple' | 'green' | 'red'> = {
  pending: 'yellow',
  confirmed: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

export default function OrdersManager() {
  const [activeStatus, setActiveStatus] = useState<Order['status'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { orders, count, loading, refetch } = useAdminOrders(
    activeStatus === 'all' ? undefined : activeStatus,
    page,
    PER_PAGE
  );

  const filtered = orders.filter((o) =>
    !search ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE);

  const handleStatusUpdate = useCallback(async (id: string, status: Order['status']) => {
    await api.admin.orders.updateStatus(id, status);
    refetch();
    setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
  }, [refetch]);

  const exportCSV = () => {
    const rows = [
      ['Order #', 'Customer', 'Email', 'Phone', 'Country', 'City', 'Address', 'Date', 'Status', 'Total'],
      ...orders.map((o) => [
        o.order_number, o.customer_name, o.customer_email, o.customer_phone ?? '',
        o.country, o.city, o.address_line1, new Date(o.created_at).toLocaleDateString(),
        o.status, o.total_amount.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `northernwest_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-display font-black text-white uppercase text-2xl sm:text-3xl tracking-widest border-l-2 border-[#FF0000] pl-4">
          ORDERS
        </h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 font-mono text-xs text-[#888888] border border-[#1a1a1a] px-3 py-2 hover:text-white hover:border-[#888888] transition-colors whitespace-nowrap"
        >
          <Download size={12} /> EXPORT CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveStatus(s); setPage(1); }}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 whitespace-nowrap transition-colors border-b-2 ${
              activeStatus === s
                ? 'text-white border-[#FF0000]'
                : 'text-[#888888] border-transparent hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order # or customer..."
          className="bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-2.5 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none w-full max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {['Order #', 'Customer', 'Email', 'Date', 'Status', 'Total', 'Items', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#888888] uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-[#1a1a1a]">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1a1a1a] animate-pulse rounded-sm w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-[#FF0000] font-display font-black text-2xl mb-2">// NO ORDERS FOUND</div>
                  <div className="text-[#444] font-mono text-xs">Try a different filter or search</div>
                </td>
              </tr>
            ) : filtered.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors"
              >
                <td className="px-4 py-3 text-[#FF0000] font-bold">{order.order_number}</td>
                <td className="px-4 py-3 text-white">{order.customer_name}</td>
                <td className="px-4 py-3 text-[#888888]">{order.customer_email}</td>
                <td className="px-4 py-3 text-[#888888]">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_MAP[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3 text-white">${order.total_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-[#888888]">{order.items?.length ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-[#888888] hover:text-white transition-colors"
                    aria-label="View order"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 font-mono text-xs ${
                page === i + 1 ? 'bg-[#FF0000] text-black' : 'border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : ''}
        size="xl"
      >
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
