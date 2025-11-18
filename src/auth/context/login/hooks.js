'use client';

import Cookies from 'js.cookie';
import { useMutation } from '@tanstack/react-query';

import axios from 'src/lib/axios';
import { useAuthStore } from 'src/store/authStore';
import { useLoginPhoneStore } from 'src/store/loginPhoneStore';

import { setSession } from '../login/utils';
import { STORAGE_KEY } from '../login/constant';
import { CREATE_OTP, VALIDATE_OTP, VALIDATE_PHONE, LOGIN_MUTATION } from './queries';
import { requestGql } from 'src/lib/graphqlRequest';

export function useEmailLoginMutation() {
  return useMutation({
    mutationKey: ['auth', 'login-email'],
    mutationFn: async ({ email, password }) => {
      const res = await requestGql('GenerateCustomerToken', LOGIN_MUTATION, { email, password });
      const token = res?.generateCustomerToken?.token;
      if (!token) throw new Error('Usuario o contraseña no válidos.');
      return token;
    },
  });
}

export function useValidatePhoneMutation() {
  const store = useLoginPhoneStore();
  return useMutation({
    mutationKey: ['auth', 'validate-phone'],
    mutationFn: async ({ phone }) => {
      const res = await requestGql('ValidatePhone', VALIDATE_PHONE, { phone });
      return res?.OtpUsersByPhone?.items || [];
    },
    onMutate: () => {
      store.setFlowLoading(true);
      store.setFlowError(null);
    },
    onError: (e) => {
      store.setFlowLoading(false);
      store.setFlowError('Error validando teléfono.');
    },
    onSuccess: async (items, { phone }) => {
      store.setFlowLoading(false);
      if (!items.length) {
        store.setFlowError('No hay cuentas asociadas a este número.');
        return;
      }
      store.setAccounts(items);
      if (items.length === 1) {
        const only = items[0];
        store.setSelectedUid(only.uid);
        // Crear OTP inmediatamente
        try {
          store.setFlowLoading(true);
          const otpRes = await requestGql('CreateOTP', CREATE_OTP, {
            uid: only.uid,
            phone,
            type: 'login',
          });
          const expStr = otpRes?.CreateOtpCode?.expiration;
          const expirationMs = expStr ? parseExpiration(expStr) : Date.now() + 180000;
          store.startOtpCountdown(expirationMs);
          store.toOtpStep();
        } catch {
          store.setFlowError('No se pudo generar el código.');
        } finally {
          store.setFlowLoading(false);
        }
      } else {
        store.toSelectStep();
      }
    },
  });
}

// Crear OTP (inicial o reenvío)
export function useCreateOtpMutation() {
  const store = useLoginPhoneStore();
  return useMutation({
    mutationKey: ['auth', 'create-otp'],
    mutationFn: async ({ uid, phone }) => {
      const res = await requestGql('CreateOTP', CREATE_OTP, { uid, phone, type: 'login' });
      return res?.CreateOtpCode;
    },
    onMutate: () => {
      store.setFlowLoading(true);
      store.setFlowError(null);
    },
    onError: () => {
      store.setFlowLoading(false);
      store.setFlowError('Error creando OTP.');
    },
    onSuccess: (data) => {
      store.setFlowLoading(false);
      const expStr = data?.expiration;
      const expirationMs = expStr ? parseExpiration(expStr) : Date.now() + 180000;
      store.startOtpCountdown(expirationMs);
      store.toOtpStep();
    },
  });
}

// Validar OTP
export function useValidateOtpMutation({ onSuccessLogin }) {
  const store = useLoginPhoneStore();
  const authStore = useAuthStore.getState();
  return useMutation({
    mutationKey: ['auth', 'validate-otp'],
    mutationFn: async ({ uid, code }) => {
      const res = await requestGql('ValidateOTP', VALIDATE_OTP, {
        uid,
        code,
        type: 'login',
      });
      return res?.ValidateOtpCode;
    },
    onMutate: () => {
      store.setFlowLoading(true);
      store.setFlowError(null);
    },
    onError: () => {
      store.setFlowLoading(false);
      store.setFlowError('Error validando código.');
    },
    onSuccess: async (data) => {
      store.setFlowLoading(false);
      if (!data?.isValid || !data?.token) {
        store.setFlowError(data?.message || 'Código inválido.');
        return;
      }
      const token = data.token;
      authStore.setToken(token);
      Cookies.set('accessToken', token, { path: '/', sameSite: 'lax' });
      try {
        await setSession(token);
      } catch {
        sessionStorage.setItem(STORAGE_KEY, token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      onSuccessLogin?.(token);
    },
  });
}

// Util para parse local (reusa lógica del view)
function parseExpiration(raw) {
  if (!raw || typeof raw !== 'string') return Date.now();
  const isoGuess = raw.replace(' ', 'T');
  const date = new Date(isoGuess);
  const ts = date.getTime();
  return Number.isNaN(ts) ? Date.now() : ts;
}
