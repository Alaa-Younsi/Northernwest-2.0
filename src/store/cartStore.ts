import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.product.id === product.id &&
              item.variant?.id === variant?.id
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id &&
                item.variant?.id === variant?.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity }] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.variant?.id === variantId
              )
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variant?.id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, item) => {
          const price =
            item.product.base_price + (item.variant?.price_modifier ?? 0);
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: 'northernwest-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
