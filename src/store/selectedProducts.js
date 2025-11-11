'use client';

/**
 * Store de productos guardados (Zustand + persist en localStorage)
 * ---------------------------------------------------------------
 * Estructura de item esperada (compatible con adaptItemToRow):
 * { id, sku, uid, name, coverUrl, price, available, inventoryType, ... }
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Clave en localStorage
const STORAGE_KEY = 'selected-products-v1';

export const useSelectedProducts = create()(
  persist(
    (set, get) => ({
      items: [],

      // Agrega si no existe (por id)
      add: (product) => {
        const id = product?.id;
        if (!id) return;
        const exists = get().items.some((p) => p.id === id);
        if (exists) return;
        set((state) => ({ items: [product, ...state.items] }));
      },

      // Elimina por id
      remove: (id) => {
        if (!id) return;
        set((state) => ({ items: state.items.filter((p) => p.id !== id) }));
      },

      // Alterna: si existe lo quita, si no lo agrega
      toggle: (product) => {
        const id = product?.id;
        if (!id) return;
        const exists = get().items.some((p) => p.id === id);
        if (exists) {
          set((state) => ({ items: state.items.filter((p) => p.id !== id) }));
        } else {
          set((state) => ({ items: [product, ...state.items] }));
        }
      },

      // Limpia toda la lista
      clear: () => set({ items: [] }),

      // Selector: está guardado?
      isSelected: (id) => {
        if (!id) return false;
        return get().items.some((p) => p.id === id);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Si en el futuro cambias el shape, puedes hacer un migrate aquí
    }
  )
);
