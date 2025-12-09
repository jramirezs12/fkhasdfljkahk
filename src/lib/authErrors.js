'use client';

/**
 * Heurística para detectar errores de autorización/ sesión expirada desde GraphQL / upstream.
 * Devuelve true si es muy probable que el error sea por token expirado / no autorizado.
 */
export function isAuthError(err) {
  if (!err) return false;
  const msg = String(err?.message || err?.toString?.() || '').toLowerCase();

  // GraphQL suele exponer errores en err.response.errors (array)
  const graphErrors = err?.response?.errors;
  const hasGraphAuth =
    Array.isArray(graphErrors) &&
    graphErrors.some(
      (e) =>
        String(e?.message || '').toLowerCase().includes("not authorized") ||
        String(e?.message || '').toLowerCase().includes("isn't authorized") ||
        (e?.extensions && e.extensions.category === 'graphql-authorization')
    );

  if (hasGraphAuth) return true;

  // Mensajes comunes
  if (msg.includes("not authorized") || msg.includes("isn't authorized") || msg.includes('authorization')) {
    return true;
  }

  return false;
}

/**
 * Maneja un error de autorización: abre el modal de sesión expirada (client store).
 * Importamos la store por estado para evitar ciclos con componentes.
 */
export async function handleAuthError(err, overrideMessage) {
  try {
    const { useAuthUiStore } = await import('src/store/authUiStore');
    const s = useAuthUiStore.getState();
    if (s && typeof s.openExpired === 'function') {
      const message = overrideMessage ?? (err?.message ? String(err.message) : 'Tu sesión expiró. Por favor inicia sesión de nuevo.');
      s.openExpired(message);
      return true;
    }
  } catch (e) {
    // no bloquear si la store no está disponible
    console.warn('handleAuthError: failed to open expired modal', e);
  }
  return false;
}
