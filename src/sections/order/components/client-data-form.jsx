'use client';

import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useGetCities } from 'src/actions/order/order';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

export function ClientDataForm() {
  const { control } = useFormContext();
  const { citiesOptions, citiesLoading, citiesError } = useGetCities();

  const cityItems = useMemo(() => citiesOptions || [], [citiesOptions]);

  return (
    <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        }}
      >
        {/* Fila 1 */}
        <Field.Text name="names" label="Nombres" size="small" margin="dense" />
        <Field.Text name="lastnames" label="Apellidos" size="small" margin="dense" />

        {/* Fila 2: teléfono (solo Colombia) */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Field.Phone
            name="phoneNumber"
            label="Teléfono"
            size="small"
            defaultCountry="CO"
            forceCallingCode
            onlyCountries={['CO']}
            disableDropdown
          />
        </Box>

        {/* Fila 3: Ciudad (select cargado desde GraphQL) */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Controller
            name="city"
            control={control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth size="small" error={!!fieldState.error}>
                <InputLabel id="city-select-label">Ciudad</InputLabel>
                <Select
                  labelId="city-select-label"
                  label="Ciudad"
                  {...field}
                  value={field.value ?? ''}
                  renderValue={(val) => {
                    const found = cityItems.find((c) => c.value === val);
                    return found ? found.label : '';
                  }}
                >
                  {citiesLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        Cargando...
                      </Box>
                    </MenuItem>
                  ) : citiesError ? (
                    <MenuItem disabled>Error al cargar ciudades</MenuItem>
                  ) : (
                    cityItems.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Box>

        {/* Fila 4: correo */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Field.Text name="email" label="Correo" size="small" margin="dense" />
        </Box>

        {/* Fila 5: dirección */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Field.Text name="address" label="Dirección" size="small" margin="dense" />
        </Box>

        {/* Nuevo: Complemento (debajo de Dirección) */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Field.Text name="complemento" label="Complemento" size="small" margin="dense" />
        </Box>

        {/* Tipo de dirección: solo Casa / Apto / Oficina, texto centrado */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Controller
            name="addressType"
            control={control}
            defaultValue="casa"
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                value={field.value}
                onChange={(_, value) => {
                  if (value !== null) field.onChange(value);
                }}
                fullWidth
                size="small"
                aria-label="Tipo de dirección"
                sx={{ display: 'flex', gap: 1 }}
              >
                <ToggleButton
                  value="casa"
                  aria-label="Casa"
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    textTransform: 'none',
                    py: 1,
                  }}
                >
                  <Iconify icon="mdi:home" width={18} />
                  <Typography variant="body2" align="center">
                    Casa
                  </Typography>
                </ToggleButton>

                <ToggleButton
                  value="apto"
                  aria-label="Apto"
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    textTransform: 'none',
                    py: 1,
                  }}
                >
                  <Iconify icon="mdi:home-city" width={18} />
                  <Typography variant="body2" align="center">
                    Apto
                  </Typography>
                </ToggleButton>

                <ToggleButton
                  value="oficina"
                  aria-label="Oficina"
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    textTransform: 'none',
                    py: 1,
                  }}
                >
                  <Iconify icon="mdi:office-building" width={18} />
                  <Typography variant="body2" align="center">
                    Oficina
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
}
