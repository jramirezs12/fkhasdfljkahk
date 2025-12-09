'use client';

import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';
import { useProductStore } from 'src/store/productStore';

import { PRODUCT_LIST, PRODUCT_BY_SKU } from './queries';

// helpers (unchanged, compacted)
const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function ensureFilter(filter) {
  if (filter && Object.keys(filter).length > 0) return filter;
  return { price: { from: '0' } };
}

function adaptItemToRow(item) {
  const price =
    item?.price_range?.minimum_price?.final_price?.value ??
    item?.price_range?.minimum_price?.regular_price?.value ??
    0;

  const categoryNames = Array.isArray(item?.categories)
    ? item.categories.map((c) => c?.name).filter(Boolean)
    : [];
  const categoryUids = Array.isArray(item?.categories)
    ? item.categories.map((c) => c?.uid).filter(Boolean)
    : [];

  const stock = Number(item?.stock_saleable ?? 0);

  const provider = item?.provider ?? null;

  let warehouseId = null;
  try {
    const wp = provider?.warehouse_product ?? item?.provider?.warehouse_product ?? null;
    if (Array.isArray(wp) && wp.length > 0) {
      warehouseId = wp[0]?.warehouse_id ?? null;
    } else if (wp && typeof wp === 'object') {
      warehouseId = wp.warehouse_id ?? null;
    }
    if (warehouseId !== null) warehouseId = String(warehouseId);
  } catch {
    warehouseId = null;
  }

  return {
    id: item?.sku || item?.uid,
    sku: item?.sku,
    uid: item?.uid,
    name: item?.name ?? '',
    category: categoryNames[0] ?? '',
    categoryNames,
    categoryUids,
    coverUrl: item?.image?.url ?? null,
    price,
    inventoryType: stock > 0 ? 'in stock' : 'out of stock',
    available: stock,
    quantity: Math.max(stock, 1),
    publish: 'published',
    createdAt: null,
    provider,
    warehouseId,
  };
}

function dedupe(items) {
  const m = new Map();
  for (const it of items) {
    const key = it?.sku || it?.uid;
    if (!key) continue;
    if (!m.has(key)) m.set(key, it);
  }
  return [...m.values()];
}

function getNextPageParam(lastPage) {
  if (!lastPage) return undefined;
  const curr = lastPage._page ?? 1;
  const total = lastPage.page_info?.total_pages ?? 1;
  return curr < total ? curr + 1 : undefined;
}

// ----------------------------- infinite hook (react-query) -----------------------------
export function useInfiniteProducts({ filter = {}, pageSize = 24, prefetchAhead = 1 } = {}) {
  const queryClient = useQueryClient();
  const normalized = ensureFilter(filter);
  const filterKey = JSON.stringify(normalized);
  const infiniteKey = ['products-infinite', pageSize, filterKey];

  const fetchPage = useCallback(
    async (page) => {
      try {
        const res = await graphqlClient.request(PRODUCT_LIST, {
          currentPage: page,
          pageSize,
          filter: normalized,
        });
        return { ...res.dropshippingProducts, _page: page };
      } catch (err) {
        const partial = err?.response?.data?.dropshippingProducts;
        if (partial) return { ...partial, _page: page };
        throw err;
      }
    },
    [pageSize, normalized]
  );

  const query = useInfiniteQuery({
    queryKey: infiniteKey,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
    getNextPageParam,
    onSuccess: (data) => {
      if (!prefetchAhead) return;
      const last = data.pages[data.pages.length - 1];
      const next = getNextPageParam(last);
      if (!next) return;
      const prefetchKey = ['products-page', pageSize, filterKey, next];
      queryClient.prefetchQuery({
        queryKey: prefetchKey,
        queryFn: () => fetchPage(next),
        staleTime: 10_000,
      });
    },
  });

  const products = useMemo(() => {
    const flat = query.data?.pages.flatMap((p) => p.items || []) ?? [];
    return dedupe(flat).map(adaptItemToRow);
  }, [query.data]);

  const hasMore = !!query.hasNextPage;
  const loadMore = async () => {
    if (!hasMore) return;
    const last = query.data?.pages?.[query.data.pages.length - 1];
    const next = getNextPageParam(last);
    if (!next) return;
    const prefetchKey = ['products-page', pageSize, filterKey, next];
    const prefetched = queryClient.getQueryData(prefetchKey);
    if (prefetched) {
      queryClient.setQueryData(infiniteKey, (old) => {
        if (!old) return old;
        const exists = old.pages.some((p) => p._page === next);
        if (exists) return old;
        return { ...old, pages: [...old.pages, prefetched] };
      });
      return;
    }
    await query.fetchNextPage();
  };

  return {
    products,
    productsLoading: query.isLoading && !query.data,
    productsError: query.error ?? null,
    productsValidating: query.isFetching && !query.isFetchingNextPage,
    hasMore,
    isLoadingMore: query.isFetchingNextPage,
    loadMore,
    totalPages: query.data?.pages?.[query.data.pages.length - 1]?.page_info?.total_pages ?? 1,
    totalCount: query.data?.pages?.[query.data.pages.length - 1]?.total_count ?? products.length,
  };
}

// ----------------------------- paged SWR hook (backwards compat) -----------------------------
export function useGetProducts(params = {}) {
  const currentPage = params?.currentPage ?? 1;
  const pageSize = params?.pageSize ?? 24;
  const normalizedFilter = ensureFilter(params?.filter);
  const swrKey = ['graphql:productListAux', currentPage, pageSize, JSON.stringify(normalizedFilter)];

  const graphFetcher = async (keyTuple) => {
    const [, page, size, filterJSON] = keyTuple || [];
    const variables = {
      currentPage: page,
      pageSize: size,
      filter: filterJSON ? JSON.parse(filterJSON) : ensureFilter(),
    };
    try {
      const res = await graphqlClient.request(PRODUCT_LIST, variables);
      return res?.dropshippingProducts ?? null;
    } catch (err) {
      const partial = err?.response?.data?.dropshippingProducts;
      if (partial) return partial;
      return null;
    }
  };

  const { data, isLoading, error, isValidating } = useSWR(swrKey, graphFetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const products = useMemo(() => (data?.items ?? []).map(adaptItemToRow), [data]);

  return {
    products,
    productsLoading: isLoading,
    productsError: error ?? null,
    productsValidating: isValidating,
    productsEmpty: !isLoading && !isValidating && products.length === 0,
    totalCount: data?.total_count ?? products.length,
    totalPages: data?.page_info?.total_pages ?? 1,
  };
}

// ----------------------------- single product fetch hook (react-query + zustand) -----------------------------
export function useGetProduct(sku, { enabled = true } = {}) {
  const storeSet = useProductStore((s) => s.setProduct);
  const storeGet = useProductStore((s) => s.getProduct);

  const queryKey = ['product', String(sku)];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await graphqlClient.request(PRODUCT_BY_SKU, { sku: String(sku) });
      const items = res?.dropshippingProducts?.items || [];
      if (!items.length) return null;
      const adapted = adaptItemToRow(items[0]);
      // store
      try {
        storeSet(String(sku), adapted);
      } catch { /* empty */ }
      return adapted;
    },
    enabled: Boolean(sku) && enabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  // if we have local cache return it synchronously as initialData
  const cached = storeGet(String(sku));
  return {
    product: query.data ?? cached ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
