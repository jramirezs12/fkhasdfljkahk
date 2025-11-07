'use client';

/**
 * =========================================================================================
 * HOOKS DE PRODUCTOS (GraphQL + SWR / SWR Infinite)
 * =========================================================================================
 * Objetivos:
 *  1. Cargar productos paginados desde Magento GraphQL.
 *  2. Ofrecer scroll infinito con "prefetch" especulativo para revelar la siguiente página
 *     de forma instantánea (sin esperar el request al momento del scroll).
 *  3. Tolerar respuestas parciales: Magento a veces devuelve `data + errors`. Se aprovecha
 *     `data` aunque haya errores.
 *  4. Deduplicar productos que podrían repetirse entre páginas (por SKU o UID).
 *  5. Proveer también un hook paginado clásico para otros componentes (ej: buscador/autocomplete).
 *  6. Filtro neutro automático cuando el backend exige `filter` pero el usuario no ha aplicado ninguno.
 *
 * Diseño:
 *  - useInfiniteProducts:
 *      * SWRInfinite controla las páginas "visibles".
 *      * Se guarda en un Map (`prefetchedRef`) las páginas adelantadas.
 *      * Al hacer `loadMore()` se verifica si la siguiente página ya está prefetched → se revela
 *        instantáneamente; si no, se incrementa el tamaño (SWR hace el fetch normal).
 *      * Prefetch configurable por `prefetchAhead` (generalmente 1).
 *      * Manejo de errores parciales dentro de `pageFetcher`.
 *  - ensureFilter(filter): evita error de backend cuando no se envía filtro.
 *  - adaptItemToRow(item): normaliza la respuesta GraphQL al modelo que usa la UI.
 *  - dedupe(items): evita productos duplicados en merges de páginas.
 *
 * Parámetros clave en useInfiniteProducts:
 *  - pageSize: cantidad de productos por página.
 *  - fallbackPageSize: tamaño alternativo si una página falla y se reintenta.
 *  - maxRetriesPerPage: número de reintentos ante fallos antes de descartar.
 *  - prefetchAhead: número de páginas a precargar por delante (normalmente 1).
 *
 * Posibles ajustes futuros:
 *  - Agregar argumento $search al query para búsqueda server-side.
 *  - Expandir atributos de producto solo cuando se entra al detalle (optimización).
 *  - Añadir abort controller para cancelar prefetch al cambiar filtros rápido.
 *  - Implementar persisted queries / caching CDN para reducir latencia.
 *
 * Uso típico en la vista:
 *  const {
 *    products, hasMore, loadMore, productsLoading, isLoadingMore
 *  } = useInfiniteProducts({ filter: { category_uid: { in: ['UID1'] } }, pageSize: 24 });
 *
 *  <ProductList
 *     products={products}
 *     hasMore={hasMore}
 *     onLoadMore={loadMore}
 *     loading={productsLoading}
 *     loadingMore={isLoadingMore}
 *  />
 *
 * =========================================================================================
 */

import useSWR from 'swr';
import { gql } from 'graphql-request';
import useSWRInfinite from 'swr/infinite';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import graphqlClient from 'src/lib/graphqlClient';
import { endpoints, fetcher as axiosFetcher } from 'src/lib/axios';

// ------------------------------------------------------------------
// Opciones base de SWR (desactivamos revalidaciones automáticas para control total)
// ------------------------------------------------------------------
const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ------------------------------------------------------------------
// Query GraphQL (única operación)
// NOTA: Si agregas búsqueda, añade $search:String y argumento search:$search.
// ------------------------------------------------------------------
const PRODUCT_LIST = gql`
  query productListAux(
    $currentPage: Int!
    $pageSize: Int!
    $filter: ProductAttributeFilterInput!
  ) {
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
// Filtro neutro: el backend exige siempre "filter".
// Ajusta si tu instancia requiere otra condición (ej: visibility, type_id, status).
// ------------------------------------------------------------------
function ensureFilter(filter) {
  if (filter && Object.keys(filter).length > 0) return filter;
  return { price: { from: '0' } }; // Devuelve todo con price >= 0
}

// ------------------------------------------------------------------
// Normalización de datos al modelo que usa la UI.
// Evita acceder directamente al shape del backend en los componentes.
// ------------------------------------------------------------------
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
    id: item?.sku || item?.uid,                 // ID estable para React
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
    quantity: Math.max(stock, 1),               // Garantiza mínimo 1 para UI de carrito
    publish: 'published',                       // Placeholder si en futuro se maneja estado
    createdAt: null,                            // Reservado para sort "latest/oldest"
  };
}

// ------------------------------------------------------------------
// Deduplicación por SKU/UID para prevenir repetidos entre páginas.
// ------------------------------------------------------------------
function dedupe(items) {
  const m = new Map();
  for (const it of items) {
    const key = it?.sku || it?.uid;
    if (!key) continue;
    if (!m.has(key)) m.set(key, it);
  }
  return [...m.values()];
}

// ==================================================================
// Hook INFINITO con Prefetch Especulativo e Instant Reveal
// ==================================================================
/**
 * useInfiniteProducts
 *
 * Parámetros:
 *  - filter: objeto ProductAttributeFilterInput para Magento.
 *  - pageSize: productos por página (lote visible).
 *  - fallbackPageSize: tamaño alterno si falla y se reintenta (deja igual si estable).
 *  - maxRetriesPerPage: reintentos antes de marcar la página como fallida.
 *  - prefetchAhead: cuántas páginas se precargan por delante (1 = siguiente).
 *
 * Flujo:
 *  1. SWRInfinite controla las páginas "visibles" (size = número de páginas reveladas).
 *  2. Cada vez que cambia `size`, se intenta prefetch (page size+1) y se guarda en `prefetchedRef`.
 *  3. Cuando el usuario hace scroll y llama loadMore():
 *       - Si la siguiente página está en `prefetchedRef` → se inserta instantáneamente (mutate).
 *       - Si NO → se incrementa `size` y SWR hace fetch normal (con latencia).
 *
 * Errores parciales:
 *  - Magento puede devolver "data + errors".
 *  - Se captura el partial en catch y se usa `data` aunque haya errores (guardando mensajes).
 */
export function useInfiniteProducts({
  filter = {},
  pageSize = 24,
  fallbackPageSize = 24,
  maxRetriesPerPage = 1,
  prefetchAhead = 1,
} = {}) {
  // Normalizamos siempre el filtro
  const normalized = ensureFilter(filter);
  const filterJSON = JSON.stringify(normalized);

  /**
   * getKey:
   *  - index empieza en 0 → página real = index + 1.
   *  - Si la página anterior tiene _done (última) → devolvemos null (SWRInfinite se detiene).
   *  - La clave incluye pageSize y filtro serializado para invalidar correctamente cuando cambian.
   */
  const getKey = (index, prev) => {
    if (prev && prev._done) return null;
    const page = index + 1;
    return ['graphql:productListInfinite', page, pageSize, filterJSON];
  };

  /**
   * pageFetcher:
   *  - Responsable de pedir una página.
   *  - Tolera errores parciales: si hay `err.response.data.products` se aprovecha.
   *  - Reintenta con `fallbackPageSize` si se configuró y falla.
   *  - Devuelve shape: { items, page_info, total_count, _done?, _partialErrors?, _error? }
   */
  const pageFetcher = useCallback(async (keyTuple) => {
    const [, page, sizeArg, filterJSONLocal] = keyTuple;
    const parsedFilter = filterJSONLocal ? JSON.parse(filterJSONLocal) : ensureFilter();

    let attempt = 0;
    let sizeToUse = sizeArg;

    const doRequest = async () => {
      try {
        const res = await graphqlClient.request(PRODUCT_LIST, {
          currentPage: page,
          pageSize: sizeToUse,
          filter: parsedFilter,
        });
        const data = res?.products;
        const tp = Number(data?.page_info?.total_pages || 1);      // total_pages
        return { data, tp, pe: [] };                               // pe = partialErrors (vacío)
      } catch (err) {
        // Respuesta parcial: usar data si existe
        const partial = err?.response?.data?.products;
        const messages = err?.response?.errors?.map((e) => e.message) || [];
        if (partial) {
          const tp = Number(partial?.page_info?.total_pages || 1);
          return { data: partial, tp, pe: messages };
        }
        throw err; // error duro (sin datos)
      }
    };

    while (attempt <= maxRetriesPerPage) {
      try {
        const { data, tp, pe } = await doRequest();
        return {
          ...data,
          _done: page >= tp,        // Marca fin si esta es la última
          _partialErrors: pe,       // Mensajes de errores parciales (si hubo)
        };
      } catch (err) {
        if (attempt < maxRetriesPerPage) {
          sizeToUse = fallbackPageSize; // Reintenta con tamaño menor
          attempt += 1;
          continue;
        }
        // Último intento fallido: devolvemos shape vacío marcando _error
        return {
          items: [],
          page_info: { total_pages: page },
          total_count: 0,
          _done: true,
          _error: String(err),
        };
      }
    }

    // Sentinela (no debería llegar aquí)
    return {
      items: [],
      page_info: { total_pages: 1 },
      total_count: 0,
      _done: true,
    };
  });

  // SWRInfinite - control de páginas visibles
  const {
    data: swrPages,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, pageFetcher, {
    ...swrOptions,
    revalidateFirstPage: true, // Revalida la primera página al cambiar de filtro
  });

  // Map con páginas prefetched → page: dataPageFetcher
  const prefetchedRef = useRef(new Map());
  // Flag para evitar correr prefetch simultáneos
  const prefetchingRef = useRef(false);

  /**
   * useMemo:
   *  - Calcula productos visibles y metadatos.
   *  - Renombres (memoTotalPages, etc.) para evitar ESLint no-shadow con variables superiores.
   */
  const {
    mapped: visibleProducts,
    memoTotalPages,
    memoHasMore,
    memoFatalError,
    memoPartialErrors,
    memoTotalCount,
  } = useMemo(() => {
    // Agrupamos todos los items de páginas visibles
    const rawItems = (swrPages || []).flatMap((p) => p?.items || []);
    // Deduplicamos por SKU/UID
    const deduped = dedupe(rawItems);
    // Adaptamos a modelo UI
    const mapped = deduped.map(adaptItemToRow);

    // Obtenemos la última página para total_pages
    const last = swrPages?.[swrPages.length - 1];
    const tp =
      Number(last?.page_info?.total_pages) ||
      Number(swrPages?.[0]?.page_info?.total_pages) ||
      1;

    // Detectamos error fatal (_error) en alguna página
    const fe = swrPages?.find((p) => p?._error)?._error;
    // Unimos errores parciales
    const pe = swrPages?.flatMap((p) => p?._partialErrors || []) || [];

    return {
      mapped,
      memoTotalPages: tp,
      memoHasMore: size < tp,
      memoFatalError: fe,
      memoPartialErrors: pe,
      memoTotalCount: last?.total_count ?? mapped.length,
    };
  }, [swrPages, size]);

  /**
   * Prefetch:
   *  - Se dispara en cada render cuando cambian dependencias.
   *  - Prefetch de páginas desde `size + 1` hasta `limit` (prefetchAhead).
   *  - Guarda el resultado en `prefetchedRef` para reveal instantáneo.
   */
  useEffect(() => {
    if (!memoHasMore) return;
    if (prefetchingRef.current) return;

    const nextPage = size + 1;
    const limit = Math.min(nextPage + (prefetchAhead - 1), memoTotalPages);

    // Verificar si ya están todas las páginas necesarias prefetched
    let needsPrefetch = false;
    for (let p = nextPage; p <= limit; p += 1) {
      if (!prefetchedRef.current.has(p)) {
        needsPrefetch = true;
        break;
      }
    }
    if (!needsPrefetch) return;

    // Marcamos estado prefetch en curso
    prefetchingRef.current = true;

    const runPrefetch = async () => {
      for (let p = nextPage; p <= limit; p += 1) {
        // Si ya está prefetched, saltear
        if (prefetchedRef.current.has(p)) continue;
        try {
          // Reutiliza pageFetcher pasando keyTuple sintético
          const data = await pageFetcher(['prefetch', p, pageSize, filterJSON]);
          prefetchedRef.current.set(p, data);
        } catch {
          // Fallo en prefetch → ignoramos, no rompen UX
          break;
        }
      }
      prefetchingRef.current = false;
    };

    runPrefetch();
  }, [memoHasMore, size, memoTotalPages, pageSize, prefetchAhead, filterJSON, pageFetcher]);

  /**
   * loadMore:
   *  - Acción usada por el sentinel del scroll.
   *  - Si la siguiente página está prefetched → mutate + setSize (instantáneo).
   *  - Si no está prefetched → setSize → SWR hará fetch normal (puede tardar).
   */
  const loadMore = useCallback(() => {
    if (!memoHasMore) return;
    const nextPage = size + 1;

    const prefetchedPage = prefetchedRef.current.get(nextPage);
    if (prefetchedPage) {
      // Insertamos la página prefetched al array de SWR sin revalidar
      mutate([...(swrPages || []), prefetchedPage], false);
      // Eliminamos del cache de prefetch
      prefetchedRef.current.delete(nextPage);
      // Incrementamos size para oficializar que la página ya es visible
      setSize(size + 1);
      return;
    }

    // No había prefetch: pasamos a fetch normal
    setSize(size + 1);
  }, [memoHasMore, size, mutate, swrPages, setSize]);

  return {
    products: visibleProducts,                                         // Lista de productos visibles
    productsLoading: isLoading && size === 0,                          // Cargando primera página
    productsError: error || (memoFatalError ? new Error(memoFatalError) : null),
    productsValidating: isValidating,                                  // Revalidando (SWR)
    totalCount: memoTotalCount,                                        // Conteo total (si backend lo devuelve)
    totalPages: memoTotalPages,
    hasMore: memoHasMore,                                              // Hay más páginas por cargar
    isLoadingMore: isLoading && size > 0,                              // Cargando página adicional
    loadMore,                                                          // Acción para scroll
    partialErrors: memoPartialErrors,                                  // Errores parciales acumulados
    isPrefetching: prefetchingRef.current,                             // Flag de prefetch en curso
  };
}

// ==================================================================
// Hook paginado simple (un solo request)
// Ideal para: autocomplete, tablas sin scroll infinito, analíticas.
// ==================================================================
export function useGetProducts(params = {}) {
  const currentPage = params?.currentPage ?? 1;
  const pageSize = params?.pageSize ?? 24;
  const normalizedFilter = ensureFilter(params?.filter);

  // Clave SWR: incluye filtro serializado para invalidar correctamente.
  const swrKey = ['graphql:productListAux', currentPage, pageSize, JSON.stringify(normalizedFilter)];

  /**
   * graphFetcher:
   *  - Request único.
   *  - Tolerancia a datos parciales igual que el infinito.
   */
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
    keepPreviousData: true, // Mantiene la página previa mientras llega la nueva
  });

  // Normalizamos resultados
  const memoizedValue = useMemo(() => {
    const items = data?.items ?? [];
    const rows = items.map(adaptItemToRow);
    return {
      products: rows,
      productsLoading: isLoading,
      productsError: error ?? null,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !isValidating && rows.length === 0,
      totalCount: data?.total_count ?? rows.length,
      totalPages: data?.page_info?.total_pages ?? 1,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

// ==================================================================
// Hook REST para detalle (si tu backend expone endpoints adicionales)
// ==================================================================
export function useGetProduct(productId) {
  const url = productId ? [endpoints.product.details, { params: { productId } }] : '';
  const { data, isLoading, error, isValidating } = useSWR(url, axiosFetcher, { ...swrOptions });

  return useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error ?? null,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );
}

// ==================================================================
// Hook REST para búsqueda (placeholder si existe endpoint dedicado)
// ==================================================================
export function useSearchProducts(query) {
  const url = query ? [endpoints.product.search, { params: { query } }] : '';
  const { data, isLoading, error, isValidating } = useSWR(url, axiosFetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  return useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error ?? null,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.results?.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );
}
