'use client';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { ProductItem } from './product-item';
import { ProductItemSkeleton } from './product-skeleton';

// Ajustes de scroll para rapidez sin encadenar
const MIN_INTERVAL_MS = 200; // intervalo mínimo entre cargas
const SCROLL_DELTA_PX = 200; // desplazamiento mínimo adicional antes de permitir otra carga
const ROOT_MARGIN = '600px 0px'; // pre-dispara ~600px antes del final
const THRESHOLD = 0; // dispara en cuanto entra al margen

export function ProductList({
  products = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  sx,
  ...other
}) {
  const sentinelRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const lastScrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return () => {};

    let observer = null;

    // Observa solo cuando no hay carga en curso y existe siguiente página
    if (hasMore && !loading && !loadingMore) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry.isIntersecting) return;

          const now = Date.now();
          if (now - lastLoadTimeRef.current < MIN_INTERVAL_MS) return;

          const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
          const delta = Math.abs(currentScrollY - lastScrollYRef.current);

          // Exige que el usuario se haya desplazado un poco más
          if (delta < SCROLL_DELTA_PX) return;

          // Registra el momento y el scroll y dispara
          lastLoadTimeRef.current = now;
          lastScrollYRef.current = currentScrollY;

          observer.unobserve(node);

          if (typeof onLoadMore === 'function') {
            onLoadMore();
          }
        },
        {
          root: null,
          rootMargin: ROOT_MARGIN,
          threshold: THRESHOLD,
        }
      );

      observer.observe(node);
    }

    return () => {
      if (observer && node) {
        observer.unobserve(node);
        observer.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, onLoadMore]);

  const renderInitialLoading = () =>
    Array.from({ length: 12 }).map((_, i) => <ProductItemSkeleton key={`init-skel-${i}`} />);

  const renderMoreLoading = () =>
    Array.from({ length: 6 }).map((_, i) => <ProductItemSkeleton key={`more-skel-${i}`} />);

  return (
    <>
      <Box
        sx={[
          {
            gap: 3,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {loading && products.length === 0
          ? renderInitialLoading()
          : products.map((p) => (
              <ProductItem key={p.id} product={p} detailsHref={paths.home.product.details(p.id)} />
            ))}

        {!loading && loadingMore && renderMoreLoading()}
      </Box>

      {/* Sentinel para cargar más */}
      <div ref={sentinelRef} style={{ width: 1, height: 1, marginTop: 8 }} />
    </>
  );
}
