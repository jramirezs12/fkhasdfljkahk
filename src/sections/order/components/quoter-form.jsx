'use client';

import { useFormContext, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export const carriers = [
  {
    value: 'inter_rapidisimo', // primera y habilitada (fila propia)
    label: 'Inter Rapidísimo',
    logo: '/assets/illustrations/characters/inter.png',
    fallback: 'IR',
    price: 15000,
    disabled: false,
  },
  {
    value: 'inter_am',
    label: 'Rapidísimo AM',
    // icon en lugar de logo
    icon: 'mdi:weather-sunny',
    fallback: 'IA',
    price: 12000,
    disabled: true, // deshabilitada
  },
  {
    value: 'inter_prueba',
    label: 'Rapidísimo Hoy',
    icon: 'mdi:weather-night',
    fallback: 'IP',
    price: 10000,
    disabled: true, // deshabilitada
  },
];

function CarrierOption({
  selected,
  disabled,
  label,
  logo,
  icon,
  fallback,
  price,
  onClick,
  fullWidth = false,
  paymentMode = 'casa',
  showDiscount = false,
  note = '',
  compact = false, // nuevo: si true renderiza versión compacta (sin precio)
}) {
  const isDiscounted = paymentMode === 'recaudo';
  const basePrice = Number(price ?? 0);
  const discountedPrice = Math.round(basePrice * 0.9);

  const fmt = (v) =>
    typeof v === 'number'
      ? v.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : v;

  // compact: icon arriba, label centrado, nota pequeña, SIN precio (aprovecha espacio)
  if (compact) {
    return (
      <Paper
        role="button"
        onClick={() => {
          if (disabled) return;
          onClick?.();
        }}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          borderRadius: 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: `1px solid ${selected ? theme.palette.primary.main : theme.vars?.palette?.divider || theme.palette.divider}`,
          bgcolor: selected
            ? (theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.06)` : 'action.hover')
            : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          transition: 'all .12s ease-in-out',
          width: fullWidth ? '100%' : 'auto',
          boxSizing: 'border-box',
          textAlign: 'center',
          minWidth: 0, // permite que el contenedor se reduzca sin salirse de la columna
        })}
      >
        {/* Icono circular */}
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logo ? (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundImage: `url(${logo})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                bgcolor: 'transparent',
              }}
              aria-label={label}
            />
          ) : (
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: disabled ? 'action.disabledBackground' : 'primary.lighter',
                color: disabled ? 'text.disabled' : 'primary.main',
              }}
            >
              <Iconify icon={icon} width={18} />
            </Avatar>
          )}
        </Box>

        {/* Label y nota (sutil) */}
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1,
            fontSize: 13,
            maxWidth: 96,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>

        {note ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {note}
          </Typography>
        ) : null}
      </Paper>
    );
  }

  // versión normal (no compact) con precio y posible -10%
  return (
    <Paper
      role="button"
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        p: 1,
        borderRadius: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${selected ? theme.palette.primary.main : theme.vars?.palette?.divider || theme.palette.divider}`,
        bgcolor: selected
          ? (theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.06)` : 'action.hover')
          : 'background.paper',
        opacity: disabled ? 0.6 : 1,
        transition: 'all .12s ease-in-out',
        width: fullWidth ? '100%' : 'auto',
        boxSizing: 'border-box',
        minWidth: 0,
      })}
    >
      {/* Icono circular (imagen si existe, sino icono) */}
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {logo ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundImage: `url(${logo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              bgcolor: 'transparent',
            }}
            aria-label={label}
          />
        ) : (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: disabled ? 'action.disabledBackground' : 'primary.lighter',
              color: disabled ? 'text.disabled' : 'primary.main',
            }}
          >
            <Iconify icon={icon} width={18} />
          </Avatar>
        )}
      </Box>

      {/* Textos: nombre arriba, nota sutil debajo, y precio (con descuento si aplica y showDiscount) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              maxWidth: 160,
            }}
          >
            {label}
          </Typography>
          {note ? (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: 11 }}>
              {note}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/*
            Si no hay price (basePrice <= 0) mostramos etiqueta "Seleccionar ciudad" en lugar del precio.
            Si existe price, mantenemos el comportamiento anterior (posible -10% y precio).
          */}
          {basePrice <= 0 ? (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Seleccionar ciudad
            </Typography>
          ) : showDiscount && isDiscounted && basePrice > 0 ? (
            <>
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled', opacity: 0.7 }}>
                ${fmt(basePrice)}
              </Typography>

              <Box
                component="span"
                sx={(theme) => ({
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  fontSize: 10,
                  px: 0.5,
                  py: '2px',
                  borderRadius: 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                -10%
              </Box>

              <Typography variant="caption" sx={{ ml: 0.5 }}>
                ${fmt(discountedPrice)}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ${fmt(basePrice)}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export function QuoterForm() {
  const { control, setValue, watch } = useFormContext();

  // paymentMode default is handled by the parent form (CreateOrderModal)
  const paymentMode = watch('paymentMode') || 'casa';
  const currentCarrier = watch('carrier') || carriers[0].value;

  // preferimos el shippingBase del formulario (si existe). IMPORTANT: no hacer fallback al carrier.price
  // para que cuando no exista shippingBase (0) se muestre "Seleccionar ciudad" en la UI.
  const shippingBase = Number(watch('shippingBase') ?? 0);
  const selectCarrier = (val, disabled) => {
    if (disabled) return;
    setValue('carrier', val, { shouldDirty: true, shouldValidate: true });
  };

  // extraemos los items para facilidad
  const rapid = carriers.find((c) => c.value === 'inter_rapidisimo');
  const others = carriers.filter((c) => c.value !== 'inter_rapidisimo');

  return (
    <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
      {/* Toggle pago: Pago en casa primero */}
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        {/* Pago en casa (primero) */}
        <Box sx={{ flex: 1 }}>
          <Button
            variant={paymentMode === 'casa' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setValue('paymentMode', 'casa', { shouldDirty: true })}
            fullWidth
            size="small"
          >
            Pago en casa
          </Button>
        </Box>

        {/* Prepago (segundo) - contiene la mini-burbujita Inter Pay */}
        <Box sx={{ position: 'relative', flex: 1 }}>
          <Button
            variant={paymentMode === 'recaudo' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setValue('paymentMode', 'recaudo', { shouldDirty: true })}
            fullWidth
            size="small"
          >
            Prepago
          </Button>

          {/* Mini burbuja ubicada en la esquina inferior derecha del botón "Prepago" */}
          <Box
            sx={(theme) => ({
              position: 'absolute',
              right: 8,
              bottom: -6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 45,
              height: 15,
              bgcolor: paymentMode === 'recaudo' ? theme.palette.common.white : theme.palette.primary.main,
              color: paymentMode === 'recaudo' ? theme.palette.primary.main : theme.palette.common.white,
              borderRadius: 1,
              fontSize: 9,
              lineHeight: 1,
              boxShadow: 1,
              pointerEvents: 'none',
              border: `1px solid ${paymentMode === 'recaudo' ? theme.palette.primary.main : 'transparent'}`,
              opacity: 0.98,
              transform: 'translateY(0.5px)',
            })}
            aria-hidden
          >
            <Box component="span" sx={{ display: 'block', textAlign: 'center', width: '100%' }}>
              Inter Pay
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Layout: Interrapidísimo en fila propia (full width).
          Le pasamos paymentMode y showDiscount para que muestre -10% cuando aplica */}
      <Controller
        name="carrier"
        control={control}
        render={() => (
          <Box>
            {rapid && (
              <Box sx={{ mb: 1 }}>
                <CarrierOption
                  selected={currentCarrier === rapid.value}
                  disabled={rapid.disabled}
                  label={rapid.label}
                  logo={rapid.logo}
                  fallback={rapid.fallback}
                  // NOTE: ahora pasamos SOLO shippingBase (sin fallback al rapid.price)
                  // de esta forma, cuando shippingBase === 0 se mostrará "Seleccionar ciudad"
                  price={shippingBase}
                  onClick={() => selectCarrier(rapid.value, rapid.disabled)}
                  fullWidth
                  paymentMode={paymentMode}
                  showDiscount
                />
              </Box>
            )}

            {/* Otras dos en una sola fila, cada una ocupa la mitad.
                Les pasamos compact=true para no mostrar precio y aprovechar espacio.
                Añadimos minWidth:0 en los contenedores para evitar overflow. */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {others.map((c) => {
                const note = c.value === 'inter_am' ? 'Entrega < 12:00' : c.value === 'inter_prueba' ? 'Entrega < 11:00' : '';
                return (
                  <Box key={c.value} sx={{ flex: 1, minWidth: 0 }}>
                    <CarrierOption
                      selected={currentCarrier === c.value}
                      disabled={c.disabled}
                      label={c.label}
                      icon={c.icon}
                      fallback={c.fallback}
                      price={c.price}
                      onClick={() => selectCarrier(c.value, c.disabled)}
                      fullWidth
                      paymentMode={paymentMode}
                      showDiscount={false}
                      note={note}
                      compact // no mostramos precio, diseño más compacto y centrado
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      />
    </Box>
  );
}
