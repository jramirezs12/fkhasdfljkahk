'use client';

/**
 * =========================================================================================
 * HOOKS DE PRODUCTOS (GraphQL + React Query + SWR)
 * =========================================================================================
 * Objetivos:
 *  1) Cargar productos paginados desde Magento GraphQL.
 *  2) Scroll infinito con prefetch especulativo de la página siguiente para "reveal" instantáneo.
 *  3) Tolerar respuestas parciales (GraphQL data + errors): aprovechar data aunque existan errores.
 *  4) Deduplicar productos entre páginas (por SKU o UID).
 *  5) Mantener un hook paginado clásico (SWR) para componentes como autocomplete.
 *  6) Incluir un filtro neutro automático cuando el backend exige "filter" pero el usuario no aplicó ninguno.
 *
 * Diseño:
 *  - useInfiniteProducts (React Query):
 *      * useInfiniteQuery controla las páginas "visibles" (pages[]).
 *      * Se precarga la página N+1 en background (prefetch) al momento que llega N.
 *      * loadMore() revela instantáneamente si la N+1 ya está en caché (sin esperar red).
 *      * Si no está prefetched, hace fetchNextPage normal.
 *  - useGetProducts (SWR): una sola página, útil para búsquedas/sugerencias.
 *  - ensureFilter(filter): evita error cuando Magento exige "filter" siempre.
 *  - adaptItemToRow(item): normaliza el shape que consume la UI.
 *  - dedupe(items): previene repetidos por mezclas de páginas.
 *
 * Uso típico:
 *   const { products, hasMore, loadMore } = useInfiniteProducts({ filter: {...}, pageSize: 24 });
 *   <ProductList products={products} hasMore={hasMore} onLoadMore={loadMore} />
 *
 * =========================================================================================
 */

import useSWR from 'swr';
import { gql } from 'graphql-request';
import { useMemo, useCallback } from 'react';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';
import { endpoints, fetcher as axiosFetcher } from 'src/lib/axios';

// ------------------------------------------------------------------
// Opciones base de SWR (para los otros hooks)
// ------------------------------------------------------------------
const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ------------------------------------------------------------------
// Query GraphQL
// ------------------------------------------------------------------
const PRODUCT_LIST = gql`
  query productListAux($currentPage: Int!, $pageSize: Int!, $filter: ProductAttributeFilterInput!) {
    products(currentPage: $currentPage, pageSize: $pageSize, filter: $filter) {
      page_info { total_pages }
      items {
        name
        sku
        uid
        image { url }
        stock_saleable
        categories { name uid }
        price_range {
          minimum_price {
            regular_price { value }
            final_price { value }
          }
        }
      }
      total_count
    }
  }
`;

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// Función externa getNextPageParam (NO usar query.options interno)
// ------------------------------------------------------------------
function getNextPageParam(lastPage, allPages) {
  if (!lastPage) return undefined;
  const curr = lastPage._page ?? 1;
  const total = lastPage.page_info?.total_pages ?? 1;
  return curr < total ? curr + 1 : undefined;
}

// ==================================================================
// Hook infinito (React Query) con prefetch de siguiente página
// ==================================================================
export function useInfiniteProducts({
  filter = {},
  pageSize = 24,
  prefetchAhead = 1, // 1 = precargar solo la siguiente
} = {}) {
  const queryClient = useQueryClient();
  const normalized = ensureFilter(filter);

  const filterKey = useMemo(() => JSON.stringify(normalized), [normalized]);
  const infiniteKey = useMemo(() => ['products-infinite', pageSize, filterKey], [pageSize, filterKey]);

  // Fetch tolerante a parciales de UNA página
  const fetchPage = useCallback(
    async (page) => {
      try {
        const res = await graphqlClient.request(PRODUCT_LIST, {
          currentPage: page,
          pageSize,
          filter: normalized,
        });
        return { ...res.products, _page: page };
      } catch (err) {
        const partial = err?.response?.data?.products;
        if (partial) return { ...partial, _page: page };
        throw err;
      }
    },
    [pageSize, normalized]
  );

  const query = useInfiniteQuery({
    queryKey: infiniteKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (lastPage, pages) => getNextPageParam(lastPage, pages),
    onSuccess: (data) => {
      if (!prefetchAhead) return;
      const last = data.pages[data.pages.length - 1];
      const next = getNextPageParam(last, data.pages);
      if (!next) return;

      // Prefetch en background
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

  const loadMore = useCallback(async () => {
    // Guards defensivos
    if (!hasMore) return;
    if (!query.data) {
      // Aún no se ha cargado la primera página
      return;
    }

    const last = query.data.pages[query.data.pages.length - 1];
    const next = getNextPageParam(last, query.data.pages);
    if (!next) return;

    const prefetchKey = ['products-page', pageSize, filterKey, next];
    const prefetched = queryClient.getQueryData(prefetchKey);

    if (prefetched) {
      // Reveal instantáneo
      queryClient.setQueryData(infiniteKey, (old) => {
        if (!old) return old;
        const exists = old.pages.some((p) => p._page === next);
        if (exists) return old;
        return { ...old, pages: [...old.pages, prefetched] };
      });
      return;
    }

    await query.fetchNextPage();
  }, [hasMore, query, pageSize, filterKey, queryClient, infiniteKey]);

  const productsLoading = query.isLoading && !query.data;
  const isLoadingMore = query.isFetchingNextPage;
  const productsError = query.error ?? null;
  const productsValidating = query.isFetching && !query.isFetchingNextPage;

  const totalPages =
    query.data?.pages?.[query.data.pages.length - 1]?.page_info?.total_pages ??
    query.data?.pages?.[0]?.page_info?.total_pages ??
    1;

  const totalCount =
    query.data?.pages?.[query.data.pages.length - 1]?.total_count ??
    products.length;

  return {
    products,
    productsLoading,
    productsError,
    productsValidating,
    hasMore,
    isLoadingMore,
    loadMore,
    totalPages,
    totalCount,
  };
}

// ==================================================================
// Paginado simple (SWR) — para autocomplete u otras vistas
// ==================================================================
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
      return res?.products ?? null;
    } catch (err) {
      const partial = err?.response?.data?.products;
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
