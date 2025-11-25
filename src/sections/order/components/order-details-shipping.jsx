import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';


// ----------------------------------------------------------------------

export function OrderDetailsShipping({ shippingAddress }) {
  return (
    <>
      <CardHeader
        title="Envío"
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Box sx={{ display: 'flex' }}>
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Dirección
          </Box>

          {shippingAddress?.fullAddress}
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Teléfono
          </Box>

          {shippingAddress?.phoneNumber}
        </Box>
      </Stack>
    </>
  );
}
