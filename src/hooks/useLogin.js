'use client';

import { useMutation } from '@tanstack/react-query';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useAuthStore } from 'src/store/authStore';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/login';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/home';

  const setToken = useAuthStore((s) => s.setToken);
  const { checkUserSession } = useAuthContext();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async (token) => {
      setToken(token);
      await checkUserSession?.();
      router.replace(returnTo);
      router.refresh();
    },
  });
}

export default useLogin;
