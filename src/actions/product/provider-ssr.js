'use server';

import { headers } from 'next/headers';
import { GraphQLClient } from 'graphql-request';

import { GET_PROVIDER_PRODUCTS } from './queries';
import { GET_WAREHOUSES_QUERY } from '../warehouses/queries';

// small utils
function unique(arr = []) { return Array.from(new Set((arr || []).filter(Boolean))); }
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

function adaptItem(item) {
  const minPrice = item?.price_range?.minimum_price;
  const price = (minPrice?.final_price?.value ?? minPrice?.regular_price?.value) ?? 0;
  const cover = item?.image?.url ?? (Array.isArray(item?.media_gallery) && item.media_gallery[0]?.url) ?? null;
  const available = Number(item?.stock_saleable ?? 0);
  const sku = item?.sku ?? '';
  const uid = item?.uid ?? '';
  const id = sku || uid || String(item?.id ?? '');

  const provider = item?.provider ?? null;

  // extract warehouseId
  let warehouseId = null;
  try {
    const wp = provider?.warehouse_product ?? item?.provider?.warehouse_product ?? null;
    if (Array.isArray(wp) && wp.length > 0) {
      warehouseId = wp[0]?.warehouse_id ?? null;
    } else if (wp && typeof wp === 'object') {
      warehouseId = wp.warehouse_id ?? null;
    }
    if (warehouseId !== null && warehouseId !== undefined) warehouseId = String(warehouseId);
    else warehouseId = null;
  } catch (err) {
    warehouseId = null;
  }

  return {
    id,
    uid,
    sku,
    name: item?.name ?? '',
    coverUrl: cover,
    price,
    priceSale: null,
    available,
    inventoryType: available > 0 ? 'in stock' : 'out of stock',
    createdAt: item?.createdAt ?? null,
    categories: item?.categories ?? [],
    media_gallery: item?.media_gallery ?? [],
    provider,
    warehouseId,
    warehouseCity: null,
  };
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
