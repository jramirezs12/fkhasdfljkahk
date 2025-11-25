'use client';

import { useState } from 'react';

import Button from '@mui/material/Button';
import { Box, Dialog, Typography, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useGetWarehouse } from 'src/hooks/warehouse/useGetWarehouse';

import { HomeContent } from 'src/layouts/home';
import { requestGql } from 'src/lib/graphqlRequest';
import { CHANGE_WAREHOUSE_STATUS } from 'src/actions/warehouses/mutations';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WarehouseCardList } from '../components/warehouse-card-list';
import { WarehouseCreateForm } from '../components/warehouse-create-form';

export function WarehouseListView() {
  const [openDialog, setOpenDialog] = useState(false);
  const { warehouses, isLoading, error, refetch } = useGetWarehouse();

  const handleSubmitDialog = () => {
    setOpenDialog(false);
    refetch();
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await requestGql('ChangeWarehouseStatus', CHANGE_WAREHOUSE_STATUS, { id });
      toast.success(`Sucursal ${currentStatus === 'active' ? 'inhabilitada' : 'habilitada'} correctamente`);
      refetch();

    } catch (e) {
      console.error(e);
      toast.error('No se pudo actualizar el estado de la sucursal');
    }
  };

  return (
    <>
      <HomeContent>
        <CustomBreadcrumbs
          heading="Sucursales"
          links={[
            { name: 'Inicio', href: paths.home.root },
            { name: 'Sucursales' },
          ]}
          action={
            <Button
              onClick={() => setOpenDialog(true)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Crear sucursal
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            Error al cargar las sucursales: {error.message}
          </Typography>
        ) : (
          <WarehouseCardList warehouses={warehouses} onToggleActive={handleToggleActive} />
        )}
      </HomeContent>

      <Dialog
        open={openDialog}
        fullWidth
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '96vw', sm: '94vw', md: '92vw', lg: '88vw', xl: '80vw' },
              maxWidth: 'none',
              height: { xs: 'auto', md: '92vh' },
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            },
          },
        }}
      >
        <WarehouseCreateForm onClose={() => setOpenDialog(false)} onSubmit={handleSubmitDialog} />
      </Dialog>
    </>
  );
}