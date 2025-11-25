'use client';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';

import { fShortenNumber } from 'src/utils/format-number';

import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function fmtDate(value) {
  if (!value) return '-';
  try {
    const d = new Date(value);
    // formato local (ajustable)
    return d.toLocaleDateString('es-CO');
  } catch {
    return String(value);
  }
}

function visibilityLabel(v) {
  if (!v) return 'Desconocida';
  if (String(v).toUpperCase() === 'PUBLIC') return 'Pública';
  if (String(v).toUpperCase() === 'PRIVATE') return 'Privada';
  return String(v);
}

/**
 * WishCard (actualizada)
 *
 * - Fondo con la imagen del primer producto (si existe)
 * - Contenido centrado
 * - Visibilidad en español
 * - Sólo muestra Items y Actualizado (sin sharing)
 * - Sin botones; toda la tarjeta es clicable y llama a onView(wishlist)
 *
 * Nota: se fuerza el color del texto del Avatar para evitar casos donde
 * el texto se renderiza en negro por temas/overrides. Usamos getContrastText
 * para mantener buena legibilidad sobre el background primary.main.
 */
export function WishCard({ wishlist, sx, onView = () => {} }) {
  const items = wishlist?.items_v2?.items ?? [];
  const firstProduct = items[0]?.product ?? null;
  const initial = (wishlist?.name && String(wishlist.name).trim()[0]) ? String(wishlist.name).trim()[0].toUpperCase() : '?';

  const cover =
    firstProduct?.image?.url ||
    wishlist?.coverUrl ||
    '/assets/placeholder.png';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onView(wishlist);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onView(wishlist)}
      onKeyDown={handleKeyDown}
      sx={[
        {
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[6],
          },
          transition: (theme) =>
            theme.transitions.create(['transform', 'box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.short,
            }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
            transform: 'translateY(0)',
          }}
        />

        <Avatar
          alt={wishlist?.name}
          sx={{
            left: 0,
            right: 0,
            width: 64,
            height: 64,
            zIndex: 11,
            mx: 'auto',
            bottom: -32,
            position: 'absolute',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 20,
            // <-- FORCE a readable text color:
            color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
          }}
        >
          {initial}
        </Avatar>

        <Image
          src={cover}
          alt={wishlist?.name ?? 'cover'}
          ratio="21/9"
          slotProps={{
            overlay: {
              sx: (theme) => ({
                bgcolor: varAlpha(theme.vars.palette.common.blackChannel, 0.20),
              }),
            },
          }}
        />
      </Box>

      <CardContent sx={{ mt: 4, px: 3, pb: 2 }}>
        <ListItemText
          primary={wishlist?.name ?? 'Lista'}
          secondary={visibilityLabel(wishlist?.visibility)}
          slotProps={{
            primary: { sx: { typography: 'subtitle1', textAlign: 'center' } },
            secondary: { sx: { mt: 0.5, textAlign: 'center', color: 'text.secondary' } },
          }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Preview compacto centrado */}
        {items.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            No hay productos en esta lista.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            {items.slice(0, 2).map((it) => {
              const p = it.product || {};
              return (
                <Box
                  key={it.id}
                  sx={{
                    width: '100%',
                    maxWidth: 320,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                    <Image
                      alt={p?.name || p?.sku}
                      src={p?.image?.url ?? '/assets/placeholder.png'}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body2" noWrap>
                      {p?.name ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      SKU: {p?.sku ?? '-'}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ ml: 'auto' }}>
                    {Number(it.quantity || 0)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        sx={{
          py: 3,
          display: 'grid',
          typography: 'subtitle1',
          gridTemplateColumns: 'repeat(2, 1fr)',
          px: 3,
          gap: 1,
          textAlign: 'center',
        }}
      >
        {[
          { label: 'Items', value: wishlist?.items_count ?? 0 },
          { label: 'Actualizado', value: fmtDate(wishlist?.updated_at) },
        ].map((stat) => (
          <Box key={stat.label} sx={{ gap: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
              {stat.label}
            </Box>
            <Typography variant="subtitle2" noWrap>
              {typeof stat.value === 'number' ? fShortenNumber(stat.value) : stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
