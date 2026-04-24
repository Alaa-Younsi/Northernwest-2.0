import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import type { Lang } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as Lang;
  const { items, removeItem, updateQuantity, totalAmount } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-[90] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
              <h2 className="font-display text-xl uppercase tracking-widest text-white">
                {t('cart.title')}
              </h2>
              <button
                onClick={onClose}
                className="text-[#888888] hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="font-mono text-[#888888] text-sm">{t('cart.empty')}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 font-mono text-xs text-[#FF0000] hover:underline"
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const name =
                    (item.product[`name_${lang}` as keyof typeof item.product] as string) ||
                    item.product.name_en;
                  const variantName = item.variant
                    ? (item.variant[`name_${lang}` as keyof typeof item.variant] as string) ||
                      item.variant.name_en
                    : null;
                  const price =
                    item.product.base_price + (item.variant?.price_modifier ?? 0);

                  return (
                    <div
                      key={`${item.product.id}-${item.variant?.id}`}
                      className="flex gap-3 border border-[#1a1a1a] p-3"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-[#111] flex-shrink-0 overflow-hidden">
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#333] text-xs font-display">
                            NW
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-white text-sm uppercase truncate">
                          {name}
                        </p>
                        {variantName && (
                          <p className="font-mono text-[#888888] text-xs">{variantName}</p>
                        )}
                        <p className="font-mono text-[#FF0000] text-sm font-semibold mt-1">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() =>
                            removeItem(item.product.id, item.variant?.id)
                          }
                          className="text-[#888888] hover:text-[#FF0000] transition-colors"
                          aria-label={t('cart.remove')}
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant?.id,
                                item.quantity - 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000] hover:text-white transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-mono text-xs text-white w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant?.id,
                                item.quantity + 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center border border-[#1a1a1a] text-[#888888] hover:border-[#FF0000] hover:text-white transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#1a1a1a] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[#888888] text-sm uppercase tracking-widest">
                    {t('cart.subtotal')}
                  </span>
                  <span className="font-mono text-white font-bold text-lg">
                    ${totalAmount().toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => { onClose(); navigate('/checkout'); }}
                >
                  {t('cart.checkout')}
                </Button>
              </div>
            )}
      </div>
    </>
  );
}
