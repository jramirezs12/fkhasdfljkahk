import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useGetGuidesZip } from 'src/hooks/order/useGetGuidesZip';

import { fDateTime } from 'src/utils/format-time';

import { downloadGuides } from 'src/actions/order/downloadGuides';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { STATUS_COLORS } from '../resources/constants';

export function OrderDetailsToolbar({
  status,
  backHref,
  createdAt,
  orderNumber,
  orderUid,
}) {
  const { refetch, isFetching } = useGetGuidesZip(orderUid);
  const { user } = useAuthContext() ?? {};
  const userRole = user?.role ?? null;

  const handleDownloadGuides = async () => {
    const { data } = await refetch()

    if (!data?.guidesZip) {
      toast.error('Hubo un error al generar las guías. Inténtalo de nuevo más tarde.');
      return;
    }

    downloadGuides(data.guidesZip, orderNumber);
  };

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
            loading={isFetching ? true : false}
            loadingIndicator="Generando..."
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={handleDownloadGuides}
          >
            Imprimir guia
          </Button>
        )}
      </Box>
    </Box>
  );
}
