import { restUrl } from 'src/lib/env';
import { setPreflight, forwardFetch, methodNotAllowed, sanitizeAuthorizationHeader } from 'src/lib/proxyHelpers';

// Para GET no hace falta desactivar bodyParser
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return setPreflight(res, 'GET');
  }

  if (req.method !== 'GET') {
    return methodNotAllowed(res, 'GET');
  }

  try {
    const backendUrl = restUrl('import/user-jobs');

    const incomingAuth = req.headers.authorization;
    const sanitizedAuth = sanitizeAuthorizationHeader(incomingAuth);

    const forwardHeaders = {};
    if (sanitizedAuth) forwardHeaders['Authorization'] = sanitizedAuth;
    if (req.headers.cookie) forwardHeaders['Cookie'] = req.headers.cookie;

    return await forwardFetch(
      backendUrl,
      {
        method: 'GET',
        headers: forwardHeaders,
      },
      res
    );
  } catch (err) {
    console.error('[api/import-user-jobs] proxy error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Proxy error', detail: String(err?.message ?? err) });
  }
}
