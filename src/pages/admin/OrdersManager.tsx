import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
  const { t } = useTranslation();
  const { orders, loading, updateStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered =
    activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="p-6">
      <h1 className="font-display font-black text-white uppercase text-3xl tracking-widest mb-6">
        {t('admin.orders')}
      </h1>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveTab(s); setPage(1); }}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 whitespace-nowrap transition-colors ${
              activeTab === s
                ? 'bg-[#FF0000] text-black'
                : 'border border-[#1a1a1a] text-[#888888] hover:text-white hover:border-[#888888]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {['Order #', 'Customer', 'Date', 'Status', 'Total', 'Items'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-[#888888] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#888888]">
                  {t('common.loading')}
                </td>
              </tr>
            ) : paginated.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-[#FF0000] font-bold">{order.order_number}</td>
                <td className="px-4 py-3 text-white">{order.customer_name}</td>
                <td className="px-4 py-3 text-[#888888]">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_MAP[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3 text-white">${order.total_amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-[#888888]">{order.items?.length ?? '—'}</td>
              </tr>
            ))}
            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#888888]">
                  No orders found
                </td>
              </tr>
            )}
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
                page === i + 1
                  ? 'bg-[#FF0000] text-black'
                  : 'border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000]'
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
            onStatusUpdate={async (id, status) => {
              await updateStatus(id, status);
              setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
            }}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
