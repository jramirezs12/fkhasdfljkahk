'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fetchWishlists } from 'src/actions/wishlist/wishlist';

import { toast } from 'src/components/snackbar';
import { WishlistCreateModal } from 'src/components/wishlist/wishlist-create-modal';

import { WishlistCardList } from '../components/wishlist-card-list';

// Vista que obtiene las wishlists del backend y las pinta en cards.
export function WishlistCardsView() {
  const router = useRouter();
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const { data: lists = null, error } = useSWR('wishlists', fetchWishlists, {
    revalidateOnFocus: false,
  });

  const handleView = (list) => {
    // usar la ruta canonical definida en paths:
    if (list?.id) {
      router.push(paths.home.product.listDetails(list.id));
    } else {
      toast.info('Lista sin ID para ver');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error cargando listas: {String(error?.message ?? error)}</Typography>
      </Box>
    );
  }

  if (lists === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Mis listas</Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setOpenCreateModal(true)}>
            Crear lista
          </Button>

        </Stack>
      </Stack>

      <WishlistCardList lists={lists} onView={handleView} />

      <WishlistCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreated={() => setOpenCreateModal(false)} />
    </Box>
  );
}
