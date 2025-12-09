'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useGetWarehouses } from 'src/hooks/warehouse/useWarehouses.js';

import { fCurrency } from 'src/utils/format-number';

import { Image } from 'src/components/image';
import { WishlistModal } from 'src/components/wishlist/wishlist-modal';

import { useCheckoutContext } from '../../checkout/context';

// ----------------------------------------------------------------------

export function ProductItem({ product, detailsHref }) {
  const { onAddToCart } = useCheckoutContext();

  const [openWishlist, setOpenWishlist] = useState(false);

  const {
    id,
    sku = '',
    name = '',
    coverUrl,
    price = 0,
    available = 0,
    priceSale = null,
    warehouseId = null,
    warehouseCity: warehouseCityFromServer = null,
  } = product || {};

  const providerRaw =
    product?.provider ||
    product?.vendor ||
    product?.seller ||
    product?.sellerName ||
    product?.supplier ||
    null;

  const providerName =
    providerRaw && typeof providerRaw === 'object'
      ? String(providerRaw.name ?? providerRaw.id ?? '')
      : providerRaw
        ? String(providerRaw)
        : 'Proveedor de prueba';

  const { data: warehouses = [], isLoading: warehousesLoading } = useGetWarehouses();

  const warehouseCity = useMemo(() => {
    if (warehouseCityFromServer) return warehouseCityFromServer;
    if (!warehouseId || !Array.isArray(warehouses) || !warehouses.length) return null;
    const found = warehouses.find((w) => String(w.id) === String(warehouseId));
    return found?.city ?? null;
  }, [warehouseId, warehouses, warehouseCityFromServer]);

  const handleAddToMyProducts = async () => {
    const newProduct = {
      id,
      name,
      coverUrl,
      available,
      price,
      colors: [],
      size: null,
      quantity: 1,
      sku,
      provider: providerName,
    };
    try {
      await onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    } finally {
      setOpenWishlist(true);
    }
  };

  return (
    <>
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Tooltip title={!available && 'Out of stock'} placement="bottom-end">
            <Image
              alt={name}
              src={coverUrl}
              ratio="1/1"
              sx={{ borderRadius: 1.5, ...(!available && { opacity: 0.48, filter: 'grayscale(1)' }) }}
            />
          </Tooltip>
        </Box>

        <Stack spacing={1.25} sx={{ textAlign: 'left', alignItems: 'flex-start' }}>
          <Link component={RouterLink} href={detailsHref} color="inherit" variant="subtitle2">
            {name}
          </Link>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
            {!!priceSale && (
              <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                {fCurrency(priceSale)}
              </Typography>
            )}
            <Typography variant="subtitle1">{fCurrency(price)}</Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            SKU: {sku || '-'}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Proveedor: {providerName}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sucursal: {warehouseCity ?? (warehousesLoading ? 'Cargando...' : 'No disponible')}
          </Typography>

          <Typography variant="caption" sx={{ color: available > 0 ? 'success.main' : 'error.main' }}>
            Stock: {Number.isFinite(available) ? available : 0}
          </Typography>

          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleAddToMyProducts}
            disabled={!available}
            sx={{ mt: 1 }}
          >
            Añadir a mis productos
          </Button>
        </Stack>
      </Card>

      <WishlistModal
        open={openWishlist}
        onClose={() => setOpenWishlist(false)}
        product={product}
      />
    </>
  );
}
