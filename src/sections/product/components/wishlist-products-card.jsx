'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Image } from 'src/components/image';

/**
 * Card para producto dentro de una wishlist.
 * Props:
 * - product: { id, name, sku, price, currency, categories, coverUrl, quantity, raw }
 * - onAdd(product) optional callback invoked when user clicks "Añadir"
 */
export function WishlistProductCard({ product, onAdd }) {
  const {
    id,
    name,
    sku,
    price,
    currency = 'COP',
    categories = [],
    coverUrl,
    quantity = 1,
  } = product || {};

  const handleAdd = async () => {
    // Llamamos al callback si se pasa; si no, no hacemos nada (solo log)
    try {
      if (typeof onAdd === 'function') {
        await onAdd(product);
      } else {
        // No-op por defecto (evita dependencia de checkout)
        // Puedes conectar onAdd desde el padre para integrar el carrito.
        // eslint-disable-next-line no-console
        console.log('Añadir producto (no-op). Implementa onAdd en el padre si deseas añadir al carrito.', product);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error en onAdd:', err);
    }
  };

  const categoryName = Array.isArray(categories) && categories[0] ? categories[0].name : '-';

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', p: 1 }}>
        <Tooltip title={name}>
          <Image alt={name} src={coverUrl} ratio="1/1" sx={{ borderRadius: 1.5 }} />
        </Tooltip>
      </Box>

      <Stack spacing={1.25} sx={{ p: 2 }}>
        <Link component={RouterLink} href={paths.home.product.details(id)} color="inherit" variant="subtitle2" noWrap>
          <Typography variant="subtitle2" component="div">
            {name}
          </Typography>
        </Link>

        <Typography variant="caption" color="text.secondary">
          SKU: {sku}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Categoria: {categoryName}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">{price !== null ? fCurrency(price, { currency }) : '-'}</Typography>

          <Button size="small" variant="contained" onClick={handleAdd}>
            Añadir
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Cantidad en la lista: {Number(quantity || 0)}
        </Typography>
      </Stack>
    </Card>
  );
}
