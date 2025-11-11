'use client';

import { setSession } from './utils';
import { requestGql, LOGIN_MUTATION } from './queries';

export const signInWithPassword = async ({ email, password }) => {
  const data = await requestGql('GenerateCustomerToken', LOGIN_MUTATION, { email, password });
  const token = data?.generateCustomerToken?.token;
  if (!token) throw new Error('Usuario o contraseña no válidos.');
  await setSession(token);
  return token;
};

export const signOut = async () => {
  await setSession(null);
};
