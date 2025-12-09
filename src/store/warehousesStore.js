'use client';

import { create } from 'zustand';

/**
 * Simple Zustand store for warehouses list + map by id.
 * - Useful for UI components to access/update warehouses without re-querying.
 */
export const useWarehousesStore = create((set, get) => ({
  list: [],
  map: {},

  setWarehouses: (items = []) =>
    set(() => ({
      list: Array.isArray(items) ? items : [],
      map: (Array.isArray(items) ? items : []).reduce((acc, it) => {
        if (it?.id != null) acc[String(it.id)] = it;
        return acc;
      }, {}),
    })),

  setWarehouse: (item) =>
    set((state) => {
      const id = item?.id ?? null;
      if (!id) return state;
      const map = { ...(state.map || {}) };
      map[String(id)] = item;
      const list = Array.isArray(state.list) ? state.list.filter((w) => String(w.id) !== String(id)) : [];
      return { list: [item, ...list], map };
    }),

  removeWarehouse: (id) =>
    set((state) => {
      const map = { ...(state.map || {}) };
      delete map[String(id)];
      const list = (state.list || []).filter((w) => String(w.id) !== String(id));
      return { list, map };
    }),

  clear: () => set({ list: [], map: {} }),
}));
