import { GraphQLClient } from 'graphql-request';

import { getAuthToken } from './authTokenStore';

// En cliente, siempre usamos el proxy interno /api/graphql-proxy.
function getGraphqlEndpoint() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }
  return process.env.INTERNAL_GRAPHQL_PROXY_URL || 'http://localhost:3000/api/graphql-proxy';
}

const client = new GraphQLClient(getGraphqlEndpoint(), {
  headers: { 'Content-Type': 'application/json' },
});

export function applyGraphqlAuth(token) {
  if (token) {
    client.setHeader('Authorization', `Bearer ${token}`);
  } else {
    client.setHeaders({ 'Content-Type': 'application/json' });
  }
}

// Inicializar header con token en memoria si existe
try {
  const t = typeof window !== 'undefined' ? getAuthToken() : null;
  if (t) {
    client.setHeader('Authorization', `Bearer ${t}`);
  }
} catch {
  // ignore
}

export default client;
