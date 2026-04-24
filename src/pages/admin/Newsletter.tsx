import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, Download, RefreshCw, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.admin.newsletter.getAll();
      setSubscribers(data as Subscriber[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    try {
      await api.admin.newsletter.delete(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.success('Subscriber removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Remove ${selected.size} subscriber(s)?`)) return;
    for (const id of Array.from(selected)) {
      await api.admin.newsletter.delete(id).catch(() => {});
    }
    setSubscribers((prev) => prev.filter((s) => !selected.has(s.id)));
    setSelected(new Set());
    toast.success(`${selected.size} subscriber(s) removed`);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === subscribers.length) setSelected(new Set());
    else setSelected(new Set(subscribers.map((s) => s.id)));
  };

  const exportCSV = () => {
    const csv = [
      'Email,Subscribed At',
      ...subscribers.map((s) => `${s.email},${new Date(s.subscribed_at).toLocaleString()}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-white uppercase tracking-widest text-2xl flex items-center gap-3">
            <Mail size={22} className="text-[#FF0000]" />
            Newsletter
          </h1>
          <p className="font-mono text-xs text-[#888888] mt-1">
            <Users size={10} className="inline mr-1" />
            {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 font-mono text-xs text-[#FF0000] border border-[#FF0000]/30 px-3 py-2 hover:bg-[#FF0000]/10 transition-colors"
            >
              <Trash2 size={12} />
              Remove {selected.size}
            </button>
          )}
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 font-mono text-xs text-[#888888] hover:text-white border border-[#1a1a1a] px-3 py-2 hover:border-[#333] transition-colors disabled:opacity-40"
          >
            <Download size={12} />
            Export CSV
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 font-mono text-xs text-[#888888] hover:text-white border border-[#1a1a1a] px-3 py-2 hover:border-[#333] transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#111] animate-pulse">
              <div className="w-4 h-4 bg-[#1a1a1a] rounded" />
              <div className="h-3 bg-[#1a1a1a] rounded w-48" />
              <div className="h-3 bg-[#1a1a1a] rounded w-32 ml-auto" />
            </div>
          ))}
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-16 text-center">
          <Mail size={40} className="text-[#333] mx-auto mb-4" />
          <p className="font-mono text-[#888888] text-sm">No subscribers yet.</p>
          <p className="font-mono text-[#555] text-xs mt-1">
            Subscribers from the newsletter form on your website will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1a1a1a] bg-[#111]">
            <input
              type="checkbox"
              checked={selected.size === subscribers.length && subscribers.length > 0}
              onChange={toggleAll}
              className="accent-[#FF0000]"
            />
            <span className="font-mono text-xs text-[#555] uppercase tracking-widest flex-1">Email</span>
            <span className="font-mono text-xs text-[#555] uppercase tracking-widest hidden sm:block">Subscribed</span>
            <span className="w-6" />
          </div>

          {/* Rows */}
          {subscribers.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-4 px-4 py-3 border-b border-[#111] transition-colors ${
                selected.has(sub.id) ? 'bg-[#FF0000]/5' : 'hover:bg-[#111]'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(sub.id)}
                onChange={() => toggleSelect(sub.id)}
                className="accent-[#FF0000]"
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail size={12} className="text-[#FF0000] flex-shrink-0" />
                <span className="font-mono text-sm text-white truncate">{sub.email}</span>
              </div>
              <span className="font-mono text-xs text-[#555] hidden sm:block whitespace-nowrap">
                {new Date(sub.subscribed_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(sub.id)}
                className="text-[#555] hover:text-[#FF0000] transition-colors p-1"
                aria-label="Remove subscriber"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
