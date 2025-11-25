import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OrderDetailsPayment({ payment }) {
  return (
    <>
      <CardHeader
        title="Pago"
      />
      <Box
        sx={{
          p: 3,
          gap: 0.5,
          display: 'flex',
          typography: 'body2',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {payment?.cardNumber}
        <Iconify icon="payments:mastercard" width={36} height="auto" />
      </Box>
    </>
  );
}
