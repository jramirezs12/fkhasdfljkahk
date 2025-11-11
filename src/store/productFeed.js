'use client';

import { create } from 'zustand';

export const useProductFeedStore = create((set, get) => ({
  categories: [],
  stock: [],
  publish: [],
  setCategories: (uids) => set({ categories: uids }),
  toggleCategory: (uid) => {
    const now = new Set(get().categories);
    if (now.has(uid)) now.delete(uid);
    else now.add(uid);
    set({ categories: Array.from(now) });
  },
  setStock: (vals) => set({ stock: vals }),
  setPublish: (vals) => set({ publish: vals }),
  reset: () => set({ categories: [], stock: [], publish: [] }),
}));
