'use client';

import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from 'src/store/authStore';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/login';

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  const { checkUserSession } = useAuthContext();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async (token) => {
      setToken(token);
      const session = await checkUserSession?.();
      return { token, session };
    },
  });
}

export default useLogin;
