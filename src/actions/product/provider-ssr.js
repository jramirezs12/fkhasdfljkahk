'use server';

import { headers } from 'next/headers';
import { GraphQLClient } from 'graphql-request';

import { GET_WAREHOUSES_QUERY } from 'src/hooks/warehouse/queries';

import { unique, adaptItem } from './adapters';
import { GET_PROVIDER_PRODUCTS } from './queries';

function resolveGraphqlUrlSSR() {
  let endpoint =
    process.env.NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL ||
    process.env.ALCARRITO_GRAPHQL_URL ||
    '';
  if (!endpoint) {
    try {
      const h = headers();
      const host = h.get('x-forwarded-host') || h.get('host');
      const proto = h.get('x-forwarded-proto') || 'http';
      if (host) endpoint = `${proto}://${host}/api/graphql-proxy`;
    } catch {
      endpoint = 'http://localhost:3000/api/graphql-proxy';
    }
  }
  try { new URL(endpoint); } catch {
    throw new Error(`Endpoint GraphQL inválido: "${endpoint}".`);
  }
  return endpoint;
}

export async function getProviderProducts(providerId, { currentPage = 1, pageSize = 24 } = {}) {
  const endpoint = resolveGraphqlUrlSSR();
  const client = new GraphQLClient(endpoint, { headers: { 'Content-Type': 'application/json' } });

  const variables = { providerId: String(providerId), currentPage, pageSize, filter: { price: { from: '0' } } };

  let data;
  try {
    data = await client.request(GET_PROVIDER_PRODUCTS, variables);
  } catch (err) {
    const partial = err?.response?.data?.dropshippingProducts;
    if (partial) data = { dropshippingProducts: partial };
    else {
      console.error('[getProviderProducts] GraphQL error', err);
      throw err;
    }
  }

  const pages = data?.dropshippingProducts;
  const items = Array.isArray(pages?.items) ? pages.items : [];
  const products = items.map(adaptItem);

  // Resolve warehouseCity server-side if we have warehouseIds
  const warehouseIds = unique(products.map((p) => p.warehouseId).filter(Boolean));
  let warehousesMap = {};
  if (warehouseIds.length) {
    try {
      const whRes = await client.request(GET_WAREHOUSES_QUERY);
      const whList = Array.isArray(whRes?.getWarehouses) ? whRes.getWarehouses : [];
      warehousesMap = Object.fromEntries(whList.map((w) => [String(w.id), w]));
    } catch (err) {
      console.warn('[getProviderProducts] failed to fetch warehouses', err?.message || err);
    }
  }

  const productsWithCity = products.map((p) => {
    const city = p.warehouseId ? (warehousesMap[String(p.warehouseId)]?.city ?? null) : null;
    return { ...p, warehouseCity: city };
  });

  const rawProvider = items[0]?.provider;
  const provider = rawProvider
    ? (typeof rawProvider === 'object' ? { id: rawProvider.id ?? rawProvider.uid ?? null, name: rawProvider.name ?? String(rawProvider) } : { id: null, name: String(rawProvider) })
    : { id: providerId, name: `Proveedor ${providerId}` };

  return { provider, products: productsWithCity, total_count: pages?.total_count ?? productsWithCity.length, page_info: pages?.page_info ?? null };
}
