'use client';

import { useMemo } from 'react';

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

import { useGetWarehouses } from 'src/actions/warehouses/warehouses';

import { Image } from 'src/components/image';

/**
 * ProviderProductCard - Tarjeta compacta para mostrar producto del proveedor.
 * Props:
 *  - product: { id, name, sku, price, currency, coverUrl, stockSaleable, stockStatus, categories, warehouseId?, warehouseCity?, provider? }
 */
export function ProviderProductCard({ product }) {
  const {
    name,
    sku,
    price,
    currency = 'COP',
    coverUrl,
    stockSaleable,
    stockStatus,
    categories = [],
  } = product || {};

  const categoryName = Array.isArray(categories) && categories[0] ? categories[0].name : '-';

  // Extraer warehouseId (prefiere product.warehouseId, luego provider.warehouse_product)
  const inferredWarehouseId = useMemo(() => {
    if (!product) return null;
    if (product.warehouseId) return String(product.warehouseId);

    const wp = product?.provider?.warehouse_product ?? product?.provider?.warehouseProduct ?? null;
    if (Array.isArray(wp) && wp.length > 0) {
      return String(wp[0]?.warehouse_id ?? wp[0]?.warehouseId ?? wp[0]?.warehouse ?? null) || null;
    }
    if (wp && typeof wp === 'object') {
      return String(wp.warehouse_id ?? wp.warehouseId ?? wp.warehouse ?? null) || null;
    }
    return null;
  }, [product]);

  // preferir valor que venga del servidor (product.warehouseCity)
  const warehouseCityFromServer = product?.warehouseCity ?? null;

  // fallback cliente: obtener lista de bodegas y buscar por id
  const { data: warehouses = [], isLoading: warehousesLoading } = useGetWarehouses();

  const warehouseCity = useMemo(() => {
    if (warehouseCityFromServer) return warehouseCityFromServer;
    if (!inferredWarehouseId || !Array.isArray(warehouses) || !warehouses.length) return null;
    const found = warehouses.find((w) => String(w.id) === String(inferredWarehouseId));
    return found?.city ?? null;
  }, [warehouseCityFromServer, inferredWarehouseId, warehouses]);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Box sx={{ position: 'relative', p: 1 }}>
        <Tooltip title={name}>
          <Image alt={name} src={coverUrl} ratio="1/1" sx={{ borderRadius: 1.5 }} />
        </Tooltip>
      </Box>

      <Stack spacing={1.25} sx={{ p: 2 }}>
        <Link component={RouterLink} href={paths.home.product.details(sku)} color="inherit" variant="subtitle2" noWrap>
          <Typography variant="subtitle2" component="div" noWrap>
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

          <Button size="small" variant="outlined" component={RouterLink} href={paths.home.product.details(sku)}>
            Ver
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Stock vendible: {Number(stockSaleable ?? 0)} {stockStatus ? `• ${stockStatus}` : ''}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Sucursal: {warehouseCity ?? (warehousesLoading ? 'Cargando...' : 'No disponible')}
        </Typography>
      </Stack>
    </Card>
  );
}

export default ProviderProductCard;
