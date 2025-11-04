import { GraphQLClient } from 'graphql-request';

const getGraphqlUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/graphql-proxy`;
  }
  return process.env.NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL || process.env.ALCARRITO_GRAPHQL_URL || '';
};

const client = new GraphQLClient(getGraphqlUrl(), {
  headers: { 'Content-Type': 'application/json' },
});

export function applyGraphqlAuth(token) {
  if (token) {
    client.setHeader('Authorization', `Bearer ${token}`);
  } else {
    client.setHeaders({ 'Content-Type': 'application/json' });
  }
}

export default client;
