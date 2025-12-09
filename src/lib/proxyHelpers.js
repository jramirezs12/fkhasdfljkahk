// Utilidades para API routes (Next.js) que actúan como proxy (JavaScript)

export const apiConfigNoBodyParser = {
  api: { bodyParser: false },
};

/**
 * sanitizeAuthorizationHeader
 * - Normaliza distintos formatos que hemos visto: `Bearer "token"`, `"token"`, `token` (raw JWT).
 * - Devuelve undefined si no hay valor válido.
 * - Si recibe un JWT "puro" (3 segmentos separados por '.') lo prefija con "Bearer ".
 */
export function sanitizeAuthorizationHeader(auth) {
  if (!auth) return undefined;
  if (typeof auth !== 'string') return undefined;

  let v = auth.trim();

  // Remove surrounding quotes entirely
  if (/^"(.*)"$/.test(v)) {
    v = v.replace(/^"(.*)"$/, '$1').trim();
  }

  // If header is exactly Bearer "token" with quotes, normalize
  const m = v.match(/^Bearer\s+"(.+)"$/i);
  if (m) return `Bearer ${m[1].trim()}`;

  // If it's already Bearer <token>, leave as-is (but normalize spacing)
  if (/^Bearer\s+/i.test(v)) {
    return v.replace(/^Bearer\s+/i, 'Bearer ').trim();
  }

  // If it's a raw token that looks like JWT (has two dots), prefix Bearer
  const parts = v.split('.');
  if (parts.length === 3) {
    return `Bearer ${v}`;
  }

  // Otherwise return the raw value (could be a custom header) — caller can decide to forward or not
  return v;
}

export async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

export function setPreflight(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(204).end();
}

export function methodNotAllowed(res, methods) {
  res.setHeader('Allow', `${methods}, OPTIONS`);
  return res.status(405).json({ message: 'Method Not Allowed' });
}

export async function forwardFetch(url, init, res, opts) {
  const resp = await fetch(url, init);
  const text = await resp.text();
  const contentType = resp.headers.get('content-type') || 'application/json';

  if (!opts || opts.exposeContentType !== false) {
    res.setHeader('Content-Type', contentType);
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(resp.status).send(text);
}
