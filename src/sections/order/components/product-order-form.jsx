'use client';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function ProductOrderForm({ product, noBackground = false }) {
  const { control } = useFormContext();

  const providerPrice = Number(product?.providerPrice ?? 0);
  const suggestedPrice = Math.round(providerPrice * 1.8 * 100) / 100;

  const availableStock = Number(
    product?.available ??
      product?.availableStock ??
      product?.stock ??
      product?.inventory?.qty ??
      product?.inventory?.quantity ??
      product?.qty ??
      0
  );

  const formatMoney = (v) =>
    Number.isFinite(Number(v))
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
          Number(v)
        )
      : '-';

  return (
    <Box
      sx={{
        backgroundColor: noBackground ? 'transparent' : 'grey.100',
        p: 2,
        borderRadius: 1,
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Box
            component="img"
            src={product?.images?.[0] || 'https://via.placeholder.com/200'}
            alt={product?.name || 'Producto'}
            sx={{
              width: '100%',
              maxWidth: 100,
              borderRadius: 1,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">{product?.name || 'Nombre del producto'}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            Precio proveedor: {formatMoney(providerPrice)}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            Precio sugerido: {formatMoney(suggestedPrice)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {availableStock > 0 ? `Stock disponible: ${availableStock}` : 'Sin stock disponible'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
        <Controller
          name="dropperPrice"
          control={control}
          rules={{
            required: 'El precio es obligatorio',
            validate: (v) => {
              const num = Number(v);
              if (Number.isNaN(num) || num <= 0) return 'Precio inválido';
              if (providerPrice > 0 && num < suggestedPrice)
                return `El precio debe ser al menos ${formatMoney(suggestedPrice)} (180% del proveedor)`;
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Precio a cobrar"
              type="number"
              size="small"
              margin="dense"
              inputProps={{
                min: providerPrice > 0 ? suggestedPrice : 0,
                step: '1000',
              }}
              error={!!fieldState.error}
              helperText={
                fieldState.error?.message ??
                (providerPrice > 0
                  ? `Debe ser al menos ${formatMoney(suggestedPrice)} (180% del proveedor)`
                  : 'Ingresa el precio')
              }
              fullWidth
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val);
              }}
            />
          )}
        />

        <Controller
          name="quantity"
          control={control}
          rules={{
            required: 'La cantidad es obligatoria',
            min: { value: 1, message: 'La cantidad mínima es 1' },
            validate: (v) => {
              const num = Number(v);
              if (!Number.isInteger(num)) return 'La cantidad debe ser un entero';
              if (availableStock === 0) return 'No hay stock disponible';
              if (num > availableStock) return `Solo hay ${availableStock} unidad${availableStock > 1 ? 'es' : ''} disponibles`;
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Cantidad"
              type="number"
              size="small"
              margin="dense"
              inputProps={{ min: 1, step: 1, max: availableStock || undefined }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
      </Box>
    </Box>
  );
}

export default ProductOrderForm;
