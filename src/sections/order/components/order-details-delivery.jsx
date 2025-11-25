import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';


// ----------------------------------------------------------------------

export function OrderDetailsDelivery({ delivery }) {
  return (
    <>
      <CardHeader
        title="Metodo de entrega"
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Enviado por
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {delivery?.carrier === 'inter' && (
              <img src="/assets/illustrations/characters/inter.png" alt={delivery?.shipBy} style={{ width: 16, height: 16 }} />
            )}
            {delivery?.shipBy}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Tracking No.
          </Box>

          <Link underline="always" color="primary">
            {delivery?.trackingNumber}
          </Link>
        </Box>
      </Stack>
    </>
  );
}
