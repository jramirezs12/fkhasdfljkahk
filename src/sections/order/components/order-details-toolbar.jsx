import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { STATUS_COLORS } from '../resources/constants';

// ----------------------------------------------------------------------

export function OrderDetailsToolbar({
  status,
  backHref,
  createdAt,
  orderNumber,
}) {

  const { user } = useAuthContext() ?? {};
  const userRole = user?.role ?? null;

  return (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        mb: { xs: 3, md: 5 },
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ gap: 1, display: 'flex', alignItems: 'flex-start' }}>
        <IconButton component={RouterLink} href={backHref}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Stack spacing={0.5}>
          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4"> Orden #{orderNumber} </Typography>
            <Label
              variant="soft"
              color={STATUS_COLORS[status] || 'default'}
            >
              {status}
            </Label>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {fDateTime(createdAt)}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          gap: 1.5,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {userRole === 'provider' && (
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
          >
            Imprimir guia
          </Button>
        )}
      </Box>
    </Box>
  );
}
