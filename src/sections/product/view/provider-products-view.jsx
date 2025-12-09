'use client';

import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { HomeContent } from 'src/layouts/home';
import graphqlClient from 'src/lib/graphqlClient';
import { fetchProviderProducts } from 'src/actions/product/provider';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { ME_QUERY } from 'src/auth/context/login/queries';

import { ProviderProductCard } from '../components/provider-product-card';

/**
 * ProviderProductsView: muestra productos del proveedor.
 * Normaliza items para exponer provider y warehouseId.
 */
export default function ProviderProductsView({ pageSize = 12 }) {
  const { data: meData, error: meError, isValidating: meValidating } = useSWR(
    'me',
    async () => {
      const res = await graphqlClient.request(ME_QUERY);
      return res?.customer ?? null;
    },
    { revalidateOnFocus: false, revalidateOnMount: false }
  );

  const [page, setPage] = useState(1);

  const providerIdRaw = useMemo(() => meData?.dropshipping_user?.id ?? null, [meData]);
  const providerId = providerIdRaw !== null && providerIdRaw !== undefined ? String(providerIdRaw) : null;

  const [productsDataLocal, setProductsDataLocal] = useState(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  // Traer productos cuando providerId o page cambien
  useEffect(() => {
    let mounted = true;
    if (!providerId) {
      setProductsDataLocal({ items: [], page_info: { total_pages: 1 }, total_count: 0 });
      setProductsError(null);
      setProductsLoading(false);
      return;
    }

    (async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await fetchProviderProducts({ providerId, currentPage: page, pageSize, filter: { price: { from: '0' } } });
        if (!mounted) return;

        const normalized = {
          ...res,
          items: (res.items || []).map((it) => {
            const priceVal =
              it?.price_range?.minimum_price?.final_price?.value ??
              it?.price_range?.minimum_price?.regular_price?.value ??
              null;

            // extraer provider y warehouseId (si vienen)
            const provider = it?.provider ?? null;
            let warehouseId = null;
            try {
              const wp = provider?.warehouse_product ?? it?.provider?.warehouse_product ?? null;
              if (Array.isArray(wp) && wp.length > 0) {
                warehouseId = wp[0]?.warehouse_id ?? wp[0]?.warehouseId ?? null;
              } else if (wp && typeof wp === 'object') {
                warehouseId = wp.warehouse_id ?? wp.warehouseId ?? null;
              }
              if (warehouseId !== null && warehouseId !== undefined) warehouseId = String(warehouseId);
              else warehouseId = null;
            } catch {
              warehouseId = null;
            }

            return {
              id: it?.id ?? it?.uid,
              name: it?.name,
              sku: it?.sku,
              price: priceVal,
              currency: 'COP',
              coverUrl: it?.image?.url ?? (it?.media_gallery?.[0]?.url ?? '/assets/placeholder.png'),
              stockSaleable: it?.stock_saleable ?? 0,
              stockStatus: it?.stock_status ?? '',
              categories: it?.categories ?? [],
              provider,
              warehouseId,
              __raw: it,
            };
          }),
        };

        setProductsDataLocal(normalized ?? { items: [], page_info: { total_pages: 1 }, total_count: 0 });
      } catch (err) {
        if (!mounted) return;
        setProductsError(err);
        setProductsDataLocal({ items: [], page_info: { total_pages: 1 }, total_count: 0 });
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        if (!mounted) return;
        setProductsLoading(false);
      }
    })();

    // eslint-disable-next-line consistent-return
    return () => {
      mounted = false;
    };
  }, [providerId, page, pageSize]);

  if (meError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error cargando usuario: {String(meError?.message ?? meError)}</Typography>
      </Box>
    );
  }

  if (!meData && meValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!providerId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No eres proveedor</Typography>
        <Typography color="text.secondary">No se detectó información de dropshipping para tu usuario.</Typography>
      </Box>
    );
  }

  if (productsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error cargando productos: {String(productsError?.message ?? productsError)}</Typography>
      </Box>
    );
  }

  const productsData = productsDataLocal;
  const items = productsData?.items ?? [];
  const totalCount = productsData?.total_count ?? 0;
  const totalPages = productsData?.page_info?.total_pages ?? 1;

  const handleChangePage = (_, newPage) => setPage(newPage);

  return (
    <HomeContent sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Mis productos</Typography>
          <Typography variant="caption" color="text.secondary">
            Productos publicados por: {meData?.firstname ?? meData?.email}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} href={paths.home.product.create} size="medium" variant="contained">
            Crear producto
          </Button>
        </Stack>
      </Stack>


      {productsLoading ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyContent
          filled
          title="No se encontraron productos"
          description="No tienes productos publicados. ¡Crea un producto para empezar a vender!"
          sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
        />
      ) : (
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
          }}
        >
          {items.map((it) => (
            <ProviderProductCard
              key={it?.sku ?? it?.id ?? JSON.stringify(it)}
              product={it}
            />
          ))}
        </Box>
      )}


      {totalCount > pageSize && (
        <Pagination
          page={page}
          count={Math.max(1, totalPages)}
          onChange={handleChangePage}
          sx={{ mt: { xs: 5, md: 8 }, mx: 'auto' }}
        />
      )}
    </HomeContent>
  );
}
