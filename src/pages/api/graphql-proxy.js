import fetch from 'node-fetch';

// Proxy simple para reenviar peticiones GraphQL al backend remoto.
// Usar solo en desarrollo/local. En producción configura CORS o un proxy adecuado.
export default async function handler(req, res) {
  // Responder preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  // Solo permitir POST (si necesitas GET, añade la lógica)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Reenviamos la petición al servidor remoto
    const response = await fetch('https://mcstaging.alcarrito.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Reenvía Authorization si la petición cliente la traía:
        Authorization: req.headers.authorization || '',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    // Reenviamos status y content-type tal cual
    res
      .status(response.status)
      .setHeader('Content-Type', response.headers.get('content-type') || 'application/json');

    return res.send(text);
  } catch (error) {
    console.error('proxy error', error);
    return res.status(500).json({ message: 'Proxy error' });
  }
}
