'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { WishlistModal } from 'src/components/wishlist/wishlist-modal';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProductDetailsToolbar({
  sx,
  publish,
  backHref,
  editHref,
  liveHref,
  publishOptions,
  onChangePublish,
  product,
  ...other
}) {
  const [openWishlist, setOpenWishlist] = useState(false);

  const { user } = useAuthContext() ?? {};
  const dropshipping = user?.dropshipping_user ?? user?.dropshipping ?? null;

  const roleCode = String(dropshipping?.role_code ?? dropshipping?.roleCode ?? user?.role ?? '').toLowerCase();
  const roleId = String(dropshipping?.role_id ?? dropshipping?.roleId ?? '').toLowerCase();

  const isProvider =
    roleCode.includes('provider') || roleCode.includes('prov') || roleId.includes('provider') || roleId.includes('prov');

  const isDropper =
    roleCode.includes('dropper') || roleCode.includes('drop') || String(user?.role ?? '').toLowerCase().includes('dropper');

  let computedBackHref;
  if (isProvider) {
    computedBackHref = paths.home.product.list;
  } else if (isDropper) {
    computedBackHref = paths.home.store.root;
  } else {
    computedBackHref = backHref ?? paths.home.root;
  }

  return (
    <Box
      sx={[
        { gap: 1.5, display: 'flex', mb: { xs: 3, md: 5 } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Button
        component={RouterLink}
        href={computedBackHref}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Back
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      {publish === 'published' && !isProvider && (
        <Tooltip title="Agregar a favoritos">
          <IconButton onClick={() => setOpenWishlist(true)}>
            <Iconify icon="solar:heart-bold" />
          </IconButton>
        </Tooltip>
      )}

      <WishlistModal open={openWishlist} onClose={() => setOpenWishlist(false)} product={product} />
    </Box>
  );
}

export default ProductDetailsToolbar;
