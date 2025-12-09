'use client';

import { create } from 'zustand';

/**
 * productStore
 * - cachea productos por sku (lectura rápida en UI)
 * - útil para evitar re-render innecesario y para persistir temporalmente la ficha
 */
export const useProductStore = create((set, get) => ({
  products: {}, // { [sku]: { data, updatedAt } }
  setProduct: (sku, data) =>
    set((s) => ({
      products: { ...s.products, [String(sku)]: { data, updatedAt: Date.now() } },
    })),
  getProduct: (sku) => {
    const p = get().products?.[String(sku)];
    return p ? p.data : null;
  },
  removeProduct: (sku) =>
    set((s) => {
      const copy = { ...s.products };
      delete copy[String(sku)];
      return { products: copy };
    }),
  clear: () => set({ products: {} }),
}));
