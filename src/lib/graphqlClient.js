import { GraphQLClient } from 'graphql-request';

const getGraphqlUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }

  const serverUrl = process.env.NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL || process.env.ALCARRITO_GRAPHQL_URL;
  if (!serverUrl) {
    return '';
  }
  return serverUrl;
};

const GRAPHQL_URL = getGraphqlUrl();

if (!GRAPHQL_URL) {
  console.error('[graphqlClient] No se pudo determinar GRAPHQL_URL. Revisa tus env vars o el proxy /api/graphql-proxy.');
}

const graphqlClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export default graphqlClient;
