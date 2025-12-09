import { create } from 'zustand';

/**
 * Simple category store: guarda el último listado de categorías
 * y una marca de timestamp para saber cuándo fue actualizado.
 * No sustituye a react-query pero permite acceso rápido desde UI sin re-query.
 */
export const useCategoryStore = create((set, get) => ({
  categories: [],
  updatedAt: null,
  setCategories: (items) => set({ categories: Array.isArray(items) ? items : [], updatedAt: Date.now() }),
  clear: () => set({ categories: [], updatedAt: null }),
}));
