import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await fetch('https://mcstaging.alcarrito.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    res
      .status(response.status)
      .setHeader('Content-Type', response.headers.get('content-type') || 'application/json');

    return res.send(text);
  } catch (error) {
    console.error('proxy error', error);
    return res.status(500).json({ message: 'Proxy error' });
  }
}
