import { restUrl } from 'src/lib/env';
import {
  setPreflight,
  forwardFetch,
  streamToBuffer,
  methodNotAllowed,
  // apiConfigNoBodyParser, // REMOVIDO: Next.js requiere objeto literal en la exportación de config
  sanitizeAuthorizationHeader,
} from 'src/lib/proxyHelpers';

// FIX: Next.js exige que `config` sea un objeto literal estático (no una referencia importada)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return setPreflight(res, 'POST');
  }
  if (req.method !== 'POST') {
    return methodNotAllowed(res, 'POST');
  }

  try {
    const backendUrl = restUrl('import/products');
    const bodyBuffer = await streamToBuffer(req);

    const incomingAuth = req.headers.authorization;
    const sanitizedAuth = sanitizeAuthorizationHeader(incomingAuth);

    const forwardHeaders = {};
    if (req.headers['content-type']) forwardHeaders['Content-Type'] = req.headers['content-type'];
    forwardHeaders['Content-Length'] = String(bodyBuffer.length);
    if (sanitizedAuth) forwardHeaders['Authorization'] = sanitizedAuth;
    if (req.headers.cookie) forwardHeaders['Cookie'] = req.headers.cookie;

    return await forwardFetch(
      backendUrl,
      {
        method: 'POST',
        headers: forwardHeaders,
        body: bodyBuffer,
      },
      res
    );
  } catch (err) {
    console.error('[api/import-products] proxy error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Proxy error', detail: String(err?.message ?? err) });
  }
}
