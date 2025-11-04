import axios from 'src/lib/axios';
import { applyGraphqlAuth } from 'src/lib/graphqlClient';

import { JWT_STORAGE_KEY } from './constant';

export function jwtDecode(token) {
  const parts = token?.split('.') || [];
  if (parts.length < 2) throw new Error('Invalid token!');
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export function isValidToken(accessToken) {
  if (!accessToken) return false;
  try {
    const decoded = jwtDecode(accessToken);
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
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
      applyGraphqlAuth(null);
    } catch (err) {
      console.error('tokenExpired error', err);
    }
  }, ms);
}

export async function setSession(accessToken) {
  if (accessToken) {
    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    applyGraphqlAuth(accessToken);
    try {
      const decoded = jwtDecode(accessToken);
      if (decoded?.exp) tokenExpired(decoded.exp);
    } catch {
      // No-JWT: sin expiración programada
    }
  } else {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    delete axios.defaults.headers.common.Authorization;
    applyGraphqlAuth(null);
  }
}

