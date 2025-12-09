'use client';

import debounce from 'lodash/debounce';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import graphqlClient from 'src/lib/graphqlClient';

import { Iconify } from 'src/components/iconify';

export const carriers = [
  {
    value: 'inter_rapidisimo',
    label: 'Inter Rapidísimo',
    logo: '/assets/illustrations/characters/inter.png',
    fallback: 'IR',
    price: 15000,
    disabled: false,
  },
  {
    value: 'inter_am',
    label: 'Rapidísimo AM',
    icon: 'mdi:weather-sunny',
    fallback: 'IA',
    price: 12000,
    disabled: true,
  },
  {
    value: 'inter_prueba',
    label: 'Rapidísimo Hoy',
    icon: 'mdi:weather-night',
    fallback: 'IP',
    price: 10000,
    disabled: true,
  },
];

// GraphQL query used for quitside quoter
const DROPSHIPPING_QUOTER = `
query DropshippingQuoter($items: DropshippingQuoterItemsInput, $shipping_city: String) {
  dropshippingQuoter(items: $items, shipping_city: $shipping_city) {
    grand_total
    profit
    success
    total_commission
    total_providers
    total_shipping
  }
}
`;

export function QuoterForm({ noBackground = false, product = null }) {
  const { control, setValue, watch } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // watch necessary fields
  const city = watch('city');
  const dropperPrice = Number(watch('dropperPrice') || 0);
  const quantity = Number(watch('quantity') || 0);
  const carrier = watch('carrier') || carriers[0].value;
  const paymentMode = watch('paymentMode') || 'casa';

  const sku = product?.sku ?? null;

  const callQuoter = useMemo(
    () =>
      debounce(async (args) => {
        // eslint-disable-next-line no-shadow
        const { sku, price, qty, cityName } = args;
        if (!sku || !cityName || !qty || !price) {
          // clear values if incomplete
          setValue('grandTotal', 0, { shouldDirty: true });
          setValue('providerTotal', 0, { shouldDirty: true });
          setValue('shippingTotal', 0, { shouldDirty: true });
          setValue('commissionTotal', 0, { shouldDirty: true });
          setValue('profitTotal', 0, { shouldDirty: true });
          setValue('shippingBase', 0, { shouldDirty: true });
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const items = {
            dropper_product_price: Number(price),
            product_qty: Number(qty),
            product_sku: String(sku),
          };

          const variables = { items, shipping_city: cityName };
          const res = await graphqlClient.request(DROPSHIPPING_QUOTER, variables);
          const q = res?.dropshippingQuoter;
          if (!q || !q.success) {
            throw new Error('No se pudo obtener cotización');
          }

          // persist quoter results into form so OrderSummary consumes them
          setValue('grandTotal', Number(q.grand_total ?? 0), { shouldDirty: true });
          setValue('providerTotal', Number(q.total_providers ?? 0), { shouldDirty: true });
          setValue('shippingTotal', Number(q.total_shipping ?? 0), { shouldDirty: true });
          setValue('commissionTotal', Number(q.total_commission ?? 0), { shouldDirty: true });
          setValue('profitTotal', Number(q.profit ?? 0), { shouldDirty: true });

          // shippingBase used locally by other components (keeps compatibility)
          setValue('shippingBase', Number(q.total_shipping ?? 0), { shouldDirty: true });
        } catch (err) {
          console.error('Quoter error', err);
          setError(err?.message ?? 'Error en cotización');
          // clear fields on error
          setValue('grandTotal', 0, { shouldDirty: true });
          setValue('providerTotal', 0, { shouldDirty: true });
          setValue('shippingTotal', 0, { shouldDirty: true });
          setValue('commissionTotal', 0, { shouldDirty: true });
          setValue('profitTotal', 0, { shouldDirty: true });
          setValue('shippingBase', 0, { shouldDirty: true });
        } finally {
          setLoading(false);
        }
      }, 350),
    [setValue]
  );

  useEffect(() => {
    const cityName = city || '';
    callQuoter({ sku, price: dropperPrice, qty: quantity, cityName });
  }, [sku, dropperPrice, quantity, city, callQuoter]);

  // UI: border + transparent background per request
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, backgroundColor: 'transparent', borderColor: 'divider' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Button variant="outlined" color={paymentMode === 'casa' ? 'primary' : 'inherit'} onClick={() => setValue('paymentMode', 'casa', { shouldDirty: true })} fullWidth size="small">Pago en casa</Button>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Button variant={paymentMode === 'recaudo' ? 'contained' : 'outlined'} onClick={() => setValue('paymentMode', 'recaudo', { shouldDirty: true })} fullWidth size="small">Prepago</Button>
        </Box>
      </Stack>

      <Controller name="carrier" control={control} render={() => (
        <Box>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {carriers.map((c) => {
                const note = c.value === 'inter_am' ? 'Entrega < 12:00' : c.value === 'inter_prueba' ? 'Entrega < 11:00' : '';
                return (
                  <Box key={c.value} sx={{ flex: 1, minWidth: 0 }}>
                    <Button fullWidth size="small" variant={carrier === c.value ? 'contained' : 'outlined'} onClick={() => setValue('carrier', c.value, { shouldDirty: true })} disabled={c.disabled}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {c.logo ? <Avatar src={c.logo} sx={{ width: 24, height: 24 }} /> : <Avatar sx={{ width: 24, height: 24 }}><Iconify icon={c.icon} /></Avatar>}
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="body2" noWrap>{c.label}</Typography>
                          {note ? <Typography variant="caption" color="text.secondary">{note}</Typography> : null}
                        </Box>
                      </Stack>
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )} />

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Cotizando...</Typography>
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error.main">{error}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">Cotización actualizada automáticamente</Typography>
        )}
      </Box>
    </Paper>
  );
}

export default QuoterForm;
