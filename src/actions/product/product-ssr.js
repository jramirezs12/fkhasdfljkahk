import { GraphQLClient } from 'graphql-request';
import { unstable_noStore as noStore } from 'next/cache';

import { PRODUCT_BY_SKU } from './queries';
import { adaptProductFromMagento } from './adapters';

// ---------- Endpoint ----------
function resolveGraphqlUrlSSR() {
  const direct =
    process.env.ALCARRITO_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL ||
    '';

  if (direct) return direct;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (siteUrl) return `${siteUrl}/api/graphql-proxy`;

  return 'http://localhost:3000/api/graphql-proxy';
}

// ---------- Headers SSR ----------
function buildSsrHeaders() {
  const base = { 'Content-Type': 'application/json' };
  const authHeader = process.env.ALCARRITO_SSR_AUTH;
  const authToken = process.env.ALCARRITO_SSR_TOKEN;
  if (authHeader) return { ...base, Authorization: authHeader };
  if (authToken) return { ...base, Authorization: `Bearer ${authToken}` };
  return base;
}

// ---------- Fetch producto (SIN cache estático) ----------
export async function getProduct(sku, providerId = null) {
  noStore();

  const endpoint = resolveGraphqlUrlSSR();
  const headers = buildSsrHeaders();

  const client = new GraphQLClient(endpoint, {
    headers,
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        cache: 'no-store',
        next: { revalidate: 0 },
      }),
  });

  const variables = { sku: String(sku) };
  if (providerId) variables.provider_id = { eq: String(providerId) };

  try {
    const data = await client.request(PRODUCT_BY_SKU, variables);
    const items = data?.dropshippingProducts?.items || [];
    if (!items.length) return { product: null };
    return { product: adaptProductFromMagento(items[0]) };
  } catch (err) {
    console.error('[SSR getProduct] GraphQL error', {
      status: err?.response?.status,
      message: err?.message,
      endpoint,
      hasAuthHeader: Boolean(headers.Authorization),
    });
    return {
      product: null,
      error: { status: err?.response?.status || 500, message: err?.message || 'fetch failed' },
    };
  }
}
