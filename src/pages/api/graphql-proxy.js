import { env, graphqlUrl } from 'src/lib/env';
import { setPreflight, forwardFetch, methodNotAllowed, sanitizeAuthorizationHeader } from 'src/lib/proxyHelpers';

// Helper para detectar si query/mutation contiene un operationName simple
function getOperationNameFromBody(body) {
  try {
    if (!body) return null;
    // body puede venir como { query: "...", variables: {...} }
    const q = typeof body === 'string' ? body : body.query || '';
    const m = q.match(/(mutation|query)\s+([A-Za-z0-9_]+)/);
    if (m) return m[2];
    return null;
  } catch {
    return null;
  }
}

// Heurística para detectar token cifrado (base64 largo sin puntos)
function looksLikeEncrypted(token) {
  if (!token || typeof token !== 'string') return false;
  const bare = token.replace(/^Bearer\s+/i, '').replace(/^"(.*)"$/, '$1').trim();
  if (bare.split('.').length === 3) return false; // es JWT
  if (bare.length < 80) return false;
  return /^[A-Za-z0-9+/=]+$/.test(bare);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return setPreflight(res, 'POST');
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

  try {
    const url = graphqlUrl();

    // Obtener operación (si podemos) para reglas especiales
    const operationName = getOperationNameFromBody(req.body);
    const isLoginOp = operationName === 'GenerateCustomerToken' || operationName === 'ValidateOTP' || operationName === 'ValidateOtpCode';

    const incomingAuth = req.headers.authorization || '';

    // Prefer cookie accessToken cuando header parezca cifrado
    let cookieToken;
    if (req.headers.cookie) {
      const m = req.headers.cookie.match(/(?:^|; )accessToken=([^;]+)/);
      if (m) {
        try {
          cookieToken = decodeURIComponent(m[1] || '');
        } catch {
          cookieToken = m[1];
        }
      }
    }

    const sanitizedHeader = sanitizeAuthorizationHeader(incomingAuth);
    const sanitizedCookie = sanitizeAuthorizationHeader(cookieToken);

    // Si la operación es login, NO forwardear Authorization (hotfix)
    let effectiveAuth;
    if (isLoginOp) {
      // Fuerza a no enviar Authorization al upstream por seguridad
      effectiveAuth = undefined;
      console.warn('[graphql-proxy] Blocking Authorization for login operation:', operationName);
    } else {
      // Normal behavior: if header looks encrypted and cookie holds JWT, prefer cookie
      if (sanitizedHeader && looksLikeEncrypted(sanitizedHeader) && sanitizedCookie && !looksLikeEncrypted(sanitizedCookie)) {
        effectiveAuth = sanitizedCookie;
        console.warn('[graphql-proxy] Detected encrypted Authorization header; using cookie instead.');
      } else if (sanitizedHeader) {
        effectiveAuth = sanitizedHeader;
      } else if (sanitizedCookie) {
        effectiveAuth = sanitizedCookie;
      } else {
        effectiveAuth = undefined;
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(env.ALCARRITO_STORE_CODE ? { store: env.ALCARRITO_STORE_CODE } : {}),
      ...(effectiveAuth ? { Authorization: effectiveAuth } : {}),
    };


    return await forwardFetch(
      url,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body),
      },
      res
    );
  } catch (error) {
    console.error('[api/graphql-proxy] proxy error', error);
    return res.status(500).json({ message: 'Proxy error' });
  }
}
