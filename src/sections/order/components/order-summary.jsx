'use client';

import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { carriers } from './quoter-form';

export function OrderSummary() {
  const { control } = useFormContext();

  // Observamos los valores relevantes del formulario una sola vez
  const [dropperPriceRaw, quantityRaw, carrierValue, paymentMode, providerPriceRaw, shippingBaseRaw] = useWatch({
    control,
    name: ['dropperPrice', 'quantity', 'carrier', 'paymentMode', 'providerPrice', 'shippingBase'],
  });

  const {
    totalARecaudar,
    providerTotal,
    baseShipping,
    shippingPrice,
    commission,
    ganancias,
    carrierLabel,
    isDiscounted,
  } = useMemo(() => {
    const dropperPrice = Number(dropperPriceRaw) || 0; // precio de venta por unidad
    const quantity = Number(quantityRaw) || 0;
    const providerPriceUnit = Number(providerPriceRaw) || 0; // precio proveedor por unidad
    const shippingBaseFromForm = Number(shippingBaseRaw) || 0;

    // Total a recaudar = precio venta * cantidad
    const totalARecaudarCalc = Math.round(dropperPrice * quantity);

    // Precio proveedor total para la cantidad
    const providerTotalCalc = Math.round(providerPriceUnit * quantity);

    const carrier = carriers.find((c) => c.value === carrierValue) || null;
    // Preferimos el valor que trajo el backend (shippingBaseFromForm). Si no existe, fallback al carriers.price.
    const baseShippingCalc = shippingBaseFromForm > 0 ? shippingBaseFromForm : Number(carrier?.price ?? 0);

    // Aplicamos 10% de descuento al envío cuando paymentMode === 'recaudo'
    const isDisc = paymentMode === 'recaudo';
    const shippingMultiplier = isDisc ? 0.9 : 1;
    const shippingCalc = Math.round(baseShippingCalc * shippingMultiplier);

    // Comisión plataforma: 2% sobre (total a recaudar + envío)
    const commissionCalc = Math.round((totalARecaudarCalc + shippingCalc) * 0.02);

    // Costo total de la operación: Precio proveedor + Envío + Comisión
    const totalCost = providerTotalCalc + shippingCalc + commissionCalc;

    // Ganancia real: Total a recaudar - Costo total
    const gananciasCalc = Math.round(totalARecaudarCalc - totalCost);

    return {
      totalARecaudar: totalARecaudarCalc,
      providerTotal: providerTotalCalc,
      baseShipping: baseShippingCalc,
      shippingPrice: shippingCalc,
      commission: commissionCalc,
      ganancias: gananciasCalc,
      carrierLabel: carrier?.label ?? '',
      isDiscounted: isDisc,
    };
  }, [dropperPriceRaw, quantityRaw, carrierValue, paymentMode, providerPriceRaw, shippingBaseRaw]);

  const fmt = (v) =>
    typeof v === 'number'
      ? v.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : v;

  return (
    <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.paper' }}>
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

      {/* Envío: mostrar precio original tachado + etiqueta -10% y nuevo precio cuando aplique */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Precio de envío {carrierLabel ? `(${carrierLabel})` : ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isDiscounted && baseShipping > 0 ? (
            <>
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.disabled', opacity: 0.7 }}
              >
                ${fmt(baseShipping)}
              </Typography>

              <Box
                component="span"
                sx={(theme) => ({
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  fontSize: 11,
                  px: 0.5,
                  py: '2px',
                  borderRadius: 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 0.5,
                })}
              >
                -10%
              </Box>

              <Typography variant="body2" sx={{ ml: 1 }}>
                ${fmt(shippingPrice)}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">${fmt(shippingPrice)}</Typography>
          )}
        </Box>
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
          <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: '700' }}>
            ${fmt(ganancias)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
