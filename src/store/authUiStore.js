'use client';

import { create } from 'zustand';

/**
 * UI store for global auth-related UI (session expired modal, etc.)
 * - Components and non-React modules can set open/close via the store.
 */
export const useAuthUiStore = create((set) => ({
  expiredOpen: false,
  expiredMessage: null,

  openExpired: (message = 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.') =>
    set({ expiredOpen: true, expiredMessage: message }),

  closeExpired: () => set({ expiredOpen: false, expiredMessage: null }),
}));
