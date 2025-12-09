import Cookies from 'js.cookie';

import axios from 'src/lib/axios';
import { requestGql } from 'src/lib/graphqlRequest';
import { applyGraphqlAuth } from 'src/lib/graphqlClient';
import { setAuthToken, clearAuthToken } from 'src/lib/authTokenStore';
import { getEncryptedToken, setEncryptedToken, removeEncryptedToken } from 'src/lib/secureStorage';

import { STORAGE_KEY } from './constant';
import { REFRESH_CUSTOMER_TOKEN } from './queries';


const DISABLE_TOKEN_EXPIRATION =
  String(process.env.NEXT_PUBLIC_DISABLE_TOKEN_EXPIRATION ?? '').toLowerCase() === 'true';

export function loginDecode(token) {
  const parts = token?.split('.') || [];
  if (parts.length < 2) throw new Error('Invalid token!');
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8'));
}

export function isValidToken(accessToken) {
  if (!accessToken) return false;
  try {
    const decoded = loginDecode(accessToken);
    if (!decoded?.exp) return true;
    if (DISABLE_TOKEN_EXPIRATION) return true;
    return decoded.exp > Date.now() / 1000;
  } catch {
    return true;
  }
}

// schedules token expiration cleanup
export function tokenExpired(exp) {
  if (DISABLE_TOKEN_EXPIRATION) return;
  const ms = Math.max(0, exp * 1000 - Date.now());
  setTimeout(() => {
    try {
      const pass = process.env.NEXT_PUBLIC_STORAGE_SECRET;
      if (pass) {
        removeEncryptedToken();
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
      delete axios.defaults.headers.common.Authorization;
      applyGraphqlAuth(null);
      clearAuthToken();
      Cookies.remove('accessToken', { path: '/' });
    } catch (err) {
      console.error('tokenExpired error', err);
    }
  }, ms);
}

// Set or clear session token (stores encrypted if passphrase configured)
export async function setSession(accessToken) {
  const pass = process.env.NEXT_PUBLIC_STORAGE_SECRET;

  if (accessToken) {
    // store encrypted if passphrase exists
    try {
      if (pass) {
        await setEncryptedToken(accessToken, pass);
      } else {
        sessionStorage.setItem(STORAGE_KEY, accessToken);
      }
    } catch (err) {
      console.error('setSession: error storing token', err);
      sessionStorage.setItem(STORAGE_KEY, accessToken);
    }

    // set axios defaults and graphql client and memory token
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    applyGraphqlAuth(accessToken);
    setAuthToken(accessToken);

    // set cookie (non-HttpOnly) as fallback for proxy/SSR reading if needed
    try {
      Cookies.set('accessToken', accessToken, { path: '/', sameSite: 'lax' });
    } catch { /* empty */ }

    // schedule expiration cleanup if token contains exp
    try {
      const decoded = loginDecode(accessToken);
      if (decoded?.exp) tokenExpired(decoded.exp);
    } catch {
      // ignore if can't decode
    }
  } else {
    // clear session
    if (pass) {
      removeEncryptedToken();
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }

    delete axios.defaults.headers.common.Authorization;
    applyGraphqlAuth(null);
    clearAuthToken();
    try {
      Cookies.remove('accessToken', { path: '/' });
    } catch { /* empty */ }
  }
}

// helper to read current token (decrypt if needed)
export async function getSessionToken() {
  const pass = process.env.NEXT_PUBLIC_STORAGE_SECRET;
  if (pass) {
    try {
      const token = await getEncryptedToken(pass);
      // si logramos desencriptar, colocamos en memoria para accesos síncronos posteriores
      if (token) setAuthToken(token);
      return token;
    } catch (err) {
      console.error('getSessionToken: decrypt failed', err);
      return null;
    }
  }
  // fallback: plain sessionStorage
  const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || null;
  if (raw) {
    setAuthToken(raw);
  }
  return raw;
}

export async function refreshSessionToken() {
  try {
    const res = await requestGql('RefreshCustomerToken', REFRESH_CUSTOMER_TOKEN, null);
    const newToken = res?.refreshCustomerToken?.token ?? null;
    if (!newToken) {
      return null;
    }
    // persist and wire up clients
    await setSession(newToken);
    return newToken;
  } catch (err) {
    console.warn('refreshSessionToken failed', err);
    return null;
  }
}
