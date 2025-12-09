'use client';

import { create } from 'zustand';

/**
 * Wishlist store (Zustand)
 * - Guarda la lista de wishlists y un mapa por id para acceso rápido en UI.
 * - Útil para mostrar/actualizar UIs inmediatamente tras mutaciones sin esperar refetch.
 */
export const useWishlistStore = create((set, get) => ({
  list: [],
  map: {},

  setWishlists: (items = []) =>
    set(() => ({
      list: Array.isArray(items) ? items : [],
      map: (Array.isArray(items) ? items : []).reduce((acc, it) => {
        if (it?.id != null) acc[String(it.id)] = it;
        return acc;
      }, {}),
    })),

  setWishlist: (item) =>
    set((state) => {
      const id = item?.id ?? null;
      if (!id) return state;
      const map = { ...(state.map || {}) };
      map[String(id)] = item;
      const list = Array.isArray(state.list) ? state.list.filter((w) => String(w.id) !== String(id)) : [];
      return { list: [item, ...list], map };
    }),

  removeWishlist: (id) =>
    set((state) => {
      const map = { ...(state.map || {}) };
      delete map[String(id)];
      const list = (state.list || []).filter((w) => String(w.id) !== String(id));
      return { list, map };
    }),

  clear: () => set({ list: [], map: {} }),
}));
