'use client';

import useSWR from 'swr';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import graphqlClient from 'src/lib/graphqlClient';

import { WishlistCardsView } from 'src/sections/product/view/wishlist-cards-view';
import ProviderProductsView from 'src/sections/product/view/provider-products-view';

import { ME_QUERY } from 'src/auth/context/login/queries';

const fetchMe = async () => {
  const res = await graphqlClient.request(ME_QUERY);
  return res?.customer ?? null;
};

export default function Page() {
  const { data: me, error, isValidating } = useSWR('me', fetchMe, { revalidateOnFocus: false });

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error cargando usuario: {String(error?.message ?? error)}</Typography>
      </Box>
    );
  }

  if (!me && isValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Determinar si es dropper.
  const dropshipping = me?.dropshipping_user ?? null;
  const roleCode = typeof dropshipping?.role_code === 'string' ? dropshipping.role_code.toLowerCase() : '';
  const isDropper = !!dropshipping && (roleCode === 'dropper' || roleCode.includes('drop'));

  // Si es dropper mostramos las wishlists; en otro caso mostramos los productos del proveedor (logged user)
  if (isDropper) {
    return <WishlistCardsView />;
  }

  // Si no es dropper renderizamos la vista de productos del proveedor (usa providerId desde ME internamente)
  return <ProviderProductsView />;
}
