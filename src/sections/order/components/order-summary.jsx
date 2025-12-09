'use client';

import { useMemo } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { carriers } from './quoter-form';

export function OrderSummary() {
  const { control } = useFormContext();

  // Observe backend-provided totals first
  const [grandTotalRaw, providerTotalRaw, shippingTotalRaw, commissionTotalRaw, profitTotalRaw, shippingBaseRaw, carrierValue, paymentMode] = useWatch({
    control,
    name: ['grandTotal', 'providerTotal', 'shippingTotal', 'commissionTotal', 'profitTotal', 'shippingBase', 'carrier', 'paymentMode'],
  });

  const totals = useMemo(() => {
    const grandTotal = Number(grandTotalRaw ?? 0);
    const providerTotal = Number(providerTotalRaw ?? 0);
    const shippingTotal = Number(shippingTotalRaw ?? 0) || Number(shippingBaseRaw ?? 0) || 0;
    const commission = Number(commissionTotalRaw ?? 0);
    const profit = Number(profitTotalRaw ?? 0);

    // If backend returned nothing (all zeros), fallback to lightweight client calc based on dropperPrice & quantity
    return { totalARecaudar: grandTotal, providerTotal, shippingPrice: shippingTotal, commission, ganancias: profit };
  }, [grandTotalRaw, providerTotalRaw, shippingTotalRaw, commissionTotalRaw, profitTotalRaw, shippingBaseRaw]);

  const { totalARecaudar, providerTotal, shippingPrice, commission, ganancias } = totals;

  const fmt = (v) =>
    typeof v === 'number'
      ? v.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : v;

  return (
    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'transparent' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Resumen de la orden
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Total a recaudar
        </Typography>
        <Typography variant="body2">${fmt(totalARecaudar)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Precio proveedor
        </Typography>
        <Typography variant="body2">${fmt(providerTotal)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Precio de envío
        </Typography>
        <Typography variant="body2">${fmt(shippingPrice)}</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          Comisión de la plataforma (2%)
        </Typography>
        <Typography variant="body2">${fmt(commission)}</Typography>
      </Box>

      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2">Ganancias</Typography>
          <Typography variant="subtitle2" sx={{ color: ganancias >= 0 ? 'success.main' : 'error.main', fontWeight: '700' }}>
            ${fmt(ganancias)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default OrderSummary;
