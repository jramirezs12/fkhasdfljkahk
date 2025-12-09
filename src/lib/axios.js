import axios from 'axios';

import { CONFIG } from 'src/global-config';
import { getEncryptedToken } from 'src/lib/secureStorage';
import { getAuthToken, setAuthToken } from 'src/lib/authTokenStore';

const isServer = typeof window === 'undefined';
const STORAGE_KEY = 'storage_x9'; // mismo que secureStorage

function stripQuotes(value) {
  if (!value || typeof value !== 'string') return value;
  return value.replace(/^"(.*)"$/, '$1');
}

function looksLikeJWT(token) {
  if (!token || typeof token !== 'string') return false;
  const t = token.trim();
  // remove Bearer prefix
  const bare = t.replace(/^Bearer\s+/i, '').trim();
  return bare.split('.').length === 3;
}

function looksLikeEncryptedBlob(token) {
  if (!token || typeof token !== 'string') return false;
  const t = token.trim().replace(/^Bearer\s+/i, '').replace(/^"(.*)"$/, '$1').trim();
  if (t.length < 80) return false; // too short to be large encrypted blob
  // base64-ish check
  return /^[A-Za-z0-9+/=]+$/.test(t);
}

const axiosInstance = axios.create({
  baseURL: isServer ? CONFIG.serverUrl : '',
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Request interceptor:
 * - Prefer token in memory (authTokenStore)
 * - If not available, try cookie (document.cookie)
 * - If cookie not available, try sessionStorage/localStorage:
 *   - If the value looks like a JWT -> use it
 *   - If it looks like an encrypted blob AND we have a passphrase, try to decrypt it (async) via secureStorage.getEncryptedToken
 *   - If decrypt succeeds, store in memory and use it
 *   - Otherwise, DO NOT forward the encrypted blob (prevent sending garbage upstream)
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window === 'undefined') return config;
    config.headers = config.headers || {};

    try {
      // 1) memory token (synchronous)
      const memToken = stripQuotes(getAuthToken());
      if (memToken && looksLikeJWT(memToken)) {
        config.headers.Authorization = memToken.startsWith('Bearer ') ? memToken : `Bearer ${memToken}`;
        return config;
      }

      // 2) cookie accessToken
      try {
        const cookieMatch = document.cookie.match(new RegExp('(?:^|; )' + 'accessToken' + '=([^;]+)'));
        if (cookieMatch && cookieMatch[1]) {
          const rawCookie = decodeURIComponent(cookieMatch[1]);
          const candidate = stripQuotes(rawCookie);
          if (looksLikeJWT(candidate)) {
            config.headers.Authorization = candidate.startsWith('Bearer ') ? candidate : `Bearer ${candidate}`;
            // sync memory for future requests
            setAuthToken(candidate);
            return config;
          }
          // if cookie looks encrypted blob, try to decrypt below (we treat cookie same as storage)
          if (looksLikeEncryptedBlob(candidate)) {
            // fallthrough to decrypt attempt
          }
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) { /* empty */  }

      // 3) storage fallback (sessionStorage/localStorage)
      const rawFromStorage =
        sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem('accessToken') || localStorage.getItem('token') || null;

      if (rawFromStorage) {
        const candidate = stripQuotes(rawFromStorage);

        // If candidate looks like JWT, use it
        if (looksLikeJWT(candidate)) {
          config.headers.Authorization = candidate.startsWith('Bearer ') ? candidate : `Bearer ${candidate}`;
          setAuthToken(candidate);
          return config;
        }

        // If candidate looks like encrypted blob, try to decrypt (if passphrase present)
        const pass = process.env.NEXT_PUBLIC_STORAGE_SECRET;
        if (looksLikeEncryptedBlob(candidate) && pass) {
          try {
            // getEncryptedToken expects passphrase; it reads STORAGE_KEY from sessionStorage internally
            const decrypted = await getEncryptedToken(pass);
            if (decrypted && looksLikeJWT(decrypted)) {
              const tokenToSend = decrypted.startsWith('Bearer ') ? decrypted : `Bearer ${decrypted}`;
              config.headers.Authorization = tokenToSend;
              // persist in-memory for subsequent sync requests
              setAuthToken(decrypted);
              return config;
            } else {
              // Decrypted value not JWT -> do NOT forward encrypted blob
              console.warn('[axios] decrypted token is not JWT, will not forward Authorization.');
            }
          } catch (decryptErr) {
            console.warn('[axios] decrypt failed for stored token:', decryptErr);
            // don't forward encrypted blob
          }
        }
      }

      // No valid token found -> ensure we don't forward encrypted/invalid Authorization
      // Remove any Authorization header possibly set elsewhere
      if (config.headers.Authorization) {
        // If header exists but not JWT, remove it
        const cand = String(config.headers.Authorization || '');
        if (!looksLikeJWT(cand)) {
          console.warn('[axios] Removing non-JWT Authorization header before request.');
          delete config.headers.Authorization;
        }
      }

      return config;
    } catch (err) {
      console.error('[axios] request interceptor error:', err);
      // Best-effort: don't break the request, just continue without custom Authorization
      if (config.headers.Authorization && !looksLikeJWT(String(config.headers.Authorization))) {
        delete config.headers.Authorization;
      }
      return config;
    }
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const message = err?.response?.data?.message || err?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];
    const res = await axiosInstance.get(url, config);
    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
