'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';

import { WishlistProductCard } from './wishlist-products-card';

/**
 * WishlistProductsList - grid responsivo con paginación ligera
 *
 * Props:
 * - products: array de objetos mapeados en wishlist-detail-view (id, name, sku, price, currency, categories, coverUrl, quantity)
 * - rowsPerPage default 12
 */
export function WishlistProductsList({ products = [], rowsPerPage = 12, sx }) {
  const [page, setPage] = useState(1);
  const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);

  const start = (page - 1) * rowsPerPage;
  const visible = products.slice(start, start + rowsPerPage);

  return (
    <>
      <Box
        sx={[
          {
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {visible.map((p) => (
          <WishlistProductCard key={p.wishlistItemId ?? p.id} product={p} />
        ))}
      </Box>

      {products.length > rowsPerPage && (
        <Pagination
          page={page}
          count={Math.max(1, Math.ceil(products.length / rowsPerPage))}
          onChange={handleChangePage}
          sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
        />
      )}
    </>
  );
}
