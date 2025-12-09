'use client';

import Cookies from 'js.cookie';

import { useAuthStore } from 'src/store/authStore';
import { requestGql } from 'src/lib/graphqlRequest';

import { setSession } from './utils';
import { LOGIN_MUTATION } from './queries';

export const signInWithPassword = async ({ email, password }) => {
  const data = await requestGql('GenerateCustomerToken', LOGIN_MUTATION, { email, password });
  const token = data?.generateCustomerToken?.token;
  if (!token) throw new Error('Usuario o contraseña no válidos.');
  await setSession(token);
  return token;
};

export const signOut = async () => {
  try {
    // clear encrypted/plain session storage and axios/graphql clients
    await setSession(null);
  } catch (err) {
    console.warn('signOut: setSession(null) failed', err);
  }
  try {
    Cookies.remove('accessToken', { path: '/' });
  } catch { /* empty */ }
  try {
    const setToken = useAuthStore.getState().setToken;
    if (typeof setToken === 'function') setToken(null);
  } catch { /* empty */ }
};
