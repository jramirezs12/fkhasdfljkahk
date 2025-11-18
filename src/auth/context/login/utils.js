import axios from 'src/lib/axios';
import { applyGraphqlAuth } from 'src/lib/graphqlClient';

import { STORAGE_KEY } from './constant';

export function loginDecode(token) {
  const parts = token?.split('.') || [];
  if (parts.length < 2) throw new Error('Invalid token!');
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export function isValidToken(accessToken) {
  if (!accessToken) return false;
  try {
    const decoded = loginDecode(accessToken);
    if (!decoded?.exp) return true;
    return decoded.exp > Date.now() / 1000;
  } catch {
    return true;
  }
}

export function tokenExpired(exp) {
  const ms = Math.max(0, exp * 1000 - Date.now());
  setTimeout(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
      applyGraphqlAuth(null);
    } catch (err) {
      console.error('tokenExpired error', err);
    }
  }, ms);
}

export async function setSession(accessToken) {
  if (accessToken) {
    sessionStorage.setItem(STORAGE_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    applyGraphqlAuth(accessToken);
    try {
      const decoded = loginDecode(accessToken);
      if (decoded?.exp) tokenExpired(decoded.exp);
    } catch {
      // sin expiración programada
    }
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    delete axios.defaults.headers.common.Authorization;
    applyGraphqlAuth(null);
  }
}

