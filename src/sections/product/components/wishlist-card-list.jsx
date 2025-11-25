'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { WishCard } from './wishlist-card';

// Grid de tarjetas con paginación simple.
export function WishlistCardList({ lists = [], rowsPerPage = 9, onView, onAdd }) {
  const [page, setPage] = useState(1);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const start = (page - 1) * rowsPerPage;
  const visible = lists.slice(start, start + rowsPerPage);

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
        }}
      >
        {visible.map((list) => (
          <WishCard key={list.id} wishlist={list} onView={onView} onAdd={onAdd} />
        ))}
      </Box>

      <Pagination
        page={page}
        shape="circular"
        count={Math.max(1, Math.ceil(lists.length / rowsPerPage))}
        onChange={handleChangePage}
        sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
      />
    </>
  );
}
