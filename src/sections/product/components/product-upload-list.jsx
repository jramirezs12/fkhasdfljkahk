'use client';

import { Fragment, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import ProductUploadBulkDialog from './product-upload-bulk-dialog';

// ----------------------------------------------------------------------

export function ProductUploadList() {
  const router = useRouter();
  const [openBulk, setOpenBulk] = useState(false);

  const goTo = (href) => router.push(href);

  const cardSx = (theme) => ({
    p: 3,
    borderRadius: 2,
    border: `1px solid ${theme.vars?.palette?.divider || theme.palette.divider}`,
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  });

  const renderBullets = (items) => (
    <List dense disablePadding>
      {items.map((text, idx) => (
        <Fragment key={idx}>
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText
              primaryTypographyProps={{ variant: 'body2', sx: { color: 'text.secondary' } }}
              primary={text}
            />
          </ListItem>
          {idx < items.length - 1 && <Divider component="li" />}
        </Fragment>
      ))}
    </List>
  );

  return (
    <>
      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        <Card sx={cardSx}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Carga Masiva</Typography>
            <Divider />
            {renderBullets([
              'Ahorra tiempo cargando múltiples productos a la vez.',
              'Sincroniza tu cuenta con archivos e integraciones externas.',
              'Sincroniza tu cuenta con archivos e integraciones externas',
              'Gestiona grandes volúmenes de productos.',
            ])}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenBulk(true)}
            >
              Cargar archivos
            </Button>
          </Stack>
        </Card>

        <Card sx={cardSx}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Carga Individual</Typography>
            <Divider />
            {renderBullets([
              'Controla cada detalle de los productos.',
              'Edita, gestiona y revisa el estado de los productos.',
              'Añade productos nuevos o catálogos pequeños.',
              'Corrige o modifica datos de productos puntuales.',
            ])}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => goTo(paths.home.product.create)}
            >
              Cargar productos
            </Button>
          </Stack>
        </Card>

        <Card sx={cardSx}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Integraciones</Typography>
            <Divider />
            {renderBullets([
              'Conecta tu tienda o ERP fácilmente.',
              'Automatiza la carga y actualización de productos.',
              'Sincroniza precios, inventario y descripciones.',
              'Reduce gestión manual y errores operativos.',
            ])}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={() => goTo(paths.home.product.integrations)}
            >
              Realizar integración
            </Button>
          </Stack>
        </Card>
      </Box>

      <ProductUploadBulkDialog open={openBulk} onClose={() => setOpenBulk(false)} />
    </>
  );
}
