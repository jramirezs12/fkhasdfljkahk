'use client';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_PROVIDER_PRODUCTS } from './queries';

export async function fetchProviderProducts({
  providerId,
  currentPage = 1,
  pageSize = 24,
  filter = { price: { from: '0' } },
} = {}) {
  if (!providerId && providerId !== 0) {
    return { items: [], page_info: { total_pages: 1 }, total_count: 0 };
  }

  const pid = String(providerId);

  const vars = {
    providerId: pid,
    currentPage,
    pageSize,
    filter,
  };

  try {
    const res = await graphqlClient.request(GET_PROVIDER_PRODUCTS, vars);
    const body = res?.dropshippingProducts ?? null;
    return body ?? { items: [], page_info: { total_pages: 1 }, total_count: 0 };
  } catch (err) {
    const partial = err?.response?.data?.dropshippingProducts;
    if (partial) {
      return partial;
    }
      return { items: [], page_info: { total_pages: 1 }, total_count: 0 };
  }
}
