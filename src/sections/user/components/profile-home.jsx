'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ProfileHome({ info, posts, sx, ...other }) {
  const { user } = useAuthContext();

  const firstName = (user?.firstName ?? user?.firstname ?? '').trim();
  const lastName = (user?.lastName ?? user?.lastname ?? '').trim();
  const displayName =
    user?.displayName || [firstName, lastName].filter(Boolean).join(' ') || user?.email || 'Usuario';
  const email = user?.email || '';

  // Nuevos campos desde el contexto
  const identificationType = user?.identificationType || '-';
  const identificationNumber = user?.identificationNumber || '-';

  const renderPostCard = () => (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Datos personales
        </Typography>

        <Box
          sx={{
            gap: 2,
            display: 'flex',
            lineHeight: '24px',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Iconify width={24} icon="mingcute:contacts-2-line" />
          <Link variant="subtitle2" color="inherit">
            {displayName}
          </Link>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px', alignItems: 'center', mb: 1.0 }}>
          <Iconify width={24} icon="solar:letter-bold" />
          <Typography variant="body2">{email}</Typography>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px', alignItems: 'center', mb: 1.0 }}>
          <Iconify width={24} icon="mdi:card-account-details-outline" />
          <Typography variant="body2">
            {identificationType}
          </Typography>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px', alignItems: 'center' }}>
          <Iconify width={24} icon="mdi:identifier" />
          <Typography variant="body2">{identificationNumber}</Typography>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Grid container spacing={0} sx={sx} {...other}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ gap: 0, display: 'flex', flexDirection: 'column' }}>
        {renderPostCard()}
      </Grid>
    </Grid>
  );
}
