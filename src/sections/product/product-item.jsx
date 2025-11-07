'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

import { useCheckoutContext } from '../checkout/context';

// ----------------------------------------------------------------------

export function ProductItem({ product, detailsHref }) {
  const { onAddToCart } = useCheckoutContext();

  // Defaults seguros
  const {
    id,
    sku = '',
    name = '',
    coverUrl,
    price = 0,
    available = 0,
    priceSale = null,
  } = product || {};

  // Proveedor: intenta varias propiedades comunes
  const provider =
    product?.provider ||
    product?.vendor ||
    product?.seller ||
    product?.sellerName ||
    product?.supplier ||
    'Proveedor de prueba';

  const handleAddToMyProducts = async () => {
    const newProduct = {
      id,
      name,
      coverUrl,
      available,
      price,
      colors: [], // opcional en tu flujo de checkout
      size: null,
      quantity: 1,
      sku,
      provider,
    };
    try {
      onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    >
      {/* Imagen */}
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

      {/* Contenido alineado a la izquierda */}
      <Stack spacing={1.25} sx={{ textAlign: 'left', alignItems: 'flex-start' }}>
        {/* Nombre */}
        <Link component={RouterLink} href={detailsHref} color="inherit" variant="subtitle2" noWrap>
          {name}
        </Link>

        {/* Precio */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
          {!!priceSale && (
            <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
              {fCurrency(priceSale)}
            </Typography>
          )}
          <Typography variant="subtitle1">{fCurrency(price)}</Typography>
        </Box>

        {/* SKU */}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          SKU: {sku || '-'}
        </Typography>

        {/* Proveedor */}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Proveedor: {provider}
        </Typography>

        {/* Stock (numérico) */}
        <Typography variant="caption" sx={{ color: available > 0 ? 'success.main' : 'error.main' }}>
          Stock: {Number.isFinite(available) ? available : 0}
        </Typography>

        {/* Botón: Añadir a mis productos */}
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
  );
}
