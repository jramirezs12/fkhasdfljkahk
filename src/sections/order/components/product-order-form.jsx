import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function ProductOrderForm({ product }) {
  const { control } = useFormContext();

  // provider price to enforce validations
  const providerPrice = Number(product?.providerPrice ?? 0);

  return (
    <Box
      sx={{
        backgroundColor: 'grey.100',
        p: 2,
        borderRadius: 1,
      }}
    >
      <Grid container spacing={1.5} alignItems="center">
        {/* Imagen */}
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
          <Typography variant="subtitle1">
            {product?.name || 'Nombre del producto'}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            Precio proveedor: ${providerPrice.toLocaleString('es-CO')}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        {/* dropperPrice con validación: >= providerPrice y <= providerPrice * 2.09 */}
        <Controller
          name="dropperPrice"
          control={control}
          rules={{
            required: 'El precio es obligatorio',
            validate: (v) => {
              const num = Number(v);
              if (Number.isNaN(num)) return 'Precio inválido';
              if (num < providerPrice) return `El precio no puede ser menor que el precio del proveedor (${providerPrice})`;
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
              inputProps={{ min: providerPrice, step: '0.01' }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
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
              inputProps={{ min: 1, step: 1 }}
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
