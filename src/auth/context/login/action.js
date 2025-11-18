'use client';

import { setSession } from './utils';
import { LOGIN_MUTATION } from './queries';
import { requestGql } from 'src/lib/graphqlRequest';

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
