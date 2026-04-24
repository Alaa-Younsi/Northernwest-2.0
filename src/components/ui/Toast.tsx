import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToastStore.getState().add(msg, 'success'),
  error: (msg: string) => useToastStore.getState().add(msg, 'error'),
  info: (msg: string) => useToastStore.getState().add(msg, 'info'),
};

const icons = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error: <XCircle size={18} className="text-[#FF0000]" />,
  info: <Info size={18} className="text-blue-400" />,
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] min-w-[280px]"
          >
            {icons[t.type]}
            <span className="font-mono text-sm text-white flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-[#888888] hover:text-white ml-2"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
