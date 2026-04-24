import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { Order } from '@/types';

const STATUSES: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_BADGE_MAP: Record<Order['status'], 'yellow' | 'blue' | 'purple' | 'green' | 'red'> = {
  pending: 'yellow',
  confirmed: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

interface OrderDetailProps {
  order: Order;
  onStatusUpdate: (id: string, status: Order['status']) => Promise<void>;
  onClose: () => void;
}

export default function OrderDetail({ order, onStatusUpdate, onClose }: OrderDetailProps) {
  const [status, setStatus] = useState<Order['status']>(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusUpdate(order.id, status);
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="font-mono text-xs text-[#888888] uppercase tracking-widest">{label}</p>
      <p className="font-mono text-sm text-white mt-0.5">{value}</p>
    </div>
  );

  return (
    <div className="p-6">
      {/* Order header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs text-[#888888]">ORDER</p>
          <p className="font-display font-black text-[#FF0000] text-2xl">{order.order_number}</p>
          <p className="font-mono text-xs text-[#888888]">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant={STATUS_BADGE_MAP[status]}>{status}</Badge>
      </div>

      {/* Customer info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Field label="Customer" value={order.customer_name} />
        <Field label="Email" value={order.customer_email} />
        <Field label="Phone" value={order.customer_phone ?? '—'} />
        <Field label="Country" value={order.country} />
        <Field label="City" value={order.city} />
        <Field label="ZIP" value={order.zip_code ?? '—'} />
        <div className="col-span-2 md:col-span-3">
          <Field label="Address" value={order.address_line1 + (order.address_line2 ? `, ${order.address_line2}` : '')} />
        </div>
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-3">Items</h3>
          <div className="border border-[#1a1a1a] overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {['Product', 'Variant', 'Qty', 'Unit Price', 'Subtotal'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[#888888] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#1a1a1a]">
                    <td className="px-3 py-2 text-white">{item.product_name_en}</td>
                    <td className="px-3 py-2 text-[#888888]">{item.variant_name_en ?? '—'}</td>
                    <td className="px-3 py-2 text-white">{item.quantity}</td>
                    <td className="px-3 py-2 text-white">${item.unit_price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-[#FF0000]">${(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-2">
            <span className="font-display font-bold text-white">
              Total: <span className="text-[#FF0000]">${order.total_amount.toFixed(2)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Status update */}
      <div className="border-t border-[#1a1a1a] pt-4">
        <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">Update Status</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 transition-colors ${
                status === s
                  ? 'bg-[#FF0000] text-black'
                  : 'border border-[#1a1a1a] text-[#888888] hover:text-white hover:border-[#888888]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={status === order.status}>
            Save Status
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
