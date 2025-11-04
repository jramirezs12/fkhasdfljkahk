import Cookies from 'js.cookie';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import axios from 'src/lib/axios';

const cookieStorage = {
  getItem: (name) => Cookies.get(name) ?? null,
  setItem: (name, value) =>
    Cookies.set(name, value, { path: '/', sameSite: 'lax' /* secure: true en prod */ }),
  removeItem: (name) => Cookies.remove(name, { path: '/' }),
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        set({ token });
      },
      logout: () => {
        delete axios.defaults.headers.common.Authorization;
        set({ token: null });
        Cookies.remove('accessToken', { path: '/' });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
