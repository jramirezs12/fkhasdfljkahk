let currentToken = null;

/**
 * Token store en memoria (síncrono).
 * - Se usa para que interceptors / clients puedan obtener el JWT de forma síncrona.
 * - NO persiste en storage; la persistencia sigue siendo secureStorage/sessionStorage.
 */
export function setAuthToken(token) {
  currentToken = token ?? null;
}

export function getAuthToken() {
  return currentToken;
}

export function clearAuthToken() {
  currentToken = null;
}
