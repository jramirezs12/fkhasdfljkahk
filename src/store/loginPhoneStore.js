'use client';

/**
 * Store del flujo de login por teléfono / OTP.
 * - Maneja pasos: 'phone' | 'select' | 'otp'
 * - mode: 'email' | 'phone'
 * - Se encarga del temporizador del código (expirationMs -> otpRemaining)
 */

import { create } from 'zustand';

const initialState = {
  mode: 'email',
  phoneStep: 'phone',
  phone: '',
  accounts: [],
  selectedUid: '',
  otpCode: '',
  expirationMs: 0,
  otpRemaining: 0,
  flowError: null,
  flowLoading: false,
  intervalId: null,
};

export const useLoginPhoneStore = create((set, get) => ({
  ...initialState,

  // Cambios de valores básicos
  setPhone: (v) => set({ phone: v }),
  setOtpCode: (v) => set({ otpCode: v }),
  setAccounts: (arr) => set({ accounts: Array.isArray(arr) ? arr : [] }),
  setSelectedUid: (uid) => set({ selectedUid: uid }),
  setFlowError: (msg) => set({ flowError: msg }),
  setFlowLoading: (flag) => set({ flowLoading: flag }),

  // Cambiar modo
  goToPhoneMode: () => set({ ...initialState, mode: 'phone' }),
  backToEmailMode: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ ...initialState, mode: 'email' });
  },

  // Pasos internos
  toSelectStep: () => set({ phoneStep: 'select' }),
  toOtpStep: () => set({ phoneStep: 'otp' }),

  backToPhoneStep: () => set({
    phoneStep: 'phone',
    accounts: [],
    selectedUid: '',
    otpCode: '',
    expirationMs: 0,
    otpRemaining: 0,
    flowError: null,
  }),

  backToSelectOrPhone: () => {
    const { accounts } = get();
    if (accounts.length > 1) {
      set({ phoneStep: 'select', otpCode: '', flowError: null });
    } else {
      set({
        phoneStep: 'phone',
        accounts: [],
        selectedUid: '',
        otpCode: '',
        expirationMs: 0,
        otpRemaining: 0,
        flowError: null,
      });
    }
  },

  // Temporizador OTP
  startOtpCountdown: (expirationMs) => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);

    const update = () => {
      const remaining = Math.max(0, Math.floor((expirationMs - Date.now()) / 1000));
      set({ otpRemaining: remaining });
      if (remaining === 0) {
        const currentId = get().intervalId;
        if (currentId) clearInterval(currentId);
        set({ intervalId: null });
      }
    };

    update();
    const id = setInterval(update, 1000);
    set({ expirationMs, intervalId: id });
  },

  resetOtpData: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      expirationMs: 0,
      otpRemaining: 0,
      intervalId: null,
      otpCode: '',
      flowError: null,
    });
  },
}));
