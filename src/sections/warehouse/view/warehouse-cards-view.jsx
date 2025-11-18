'use client';

import { useState } from 'react';

import Button from '@mui/material/Button';
import { Box, Dialog, Typography, CircularProgress } from '@mui/material';

import { useGetWarehouse } from 'src/hooks/warehouse/useGetWarehouse';

import { HomeContent } from 'src/layouts/home';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { WarehouseForm } from '../components/warehouse-form';
import { WarehouseCardList } from '../components/warehouse-card-list';
import { SnackbarRoot } from 'src/components/snackbar/styles';

// ----------------------------------------------------------------------

export function WarehouseCardsView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const { warehouses, isLoading, error, refetch } = useGetWarehouse();

  const handleOpenCreate = () => {
    setSelectedWarehouse(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    refetch();
  };

  const handleEditWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setOpenDialog(true);
  };

  return (
    <>
      <HomeContent sx={{ ml: -5 }}>
        <CustomBreadcrumbs
          action={
            <Button
              onClick={handleOpenCreate}
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
            Error al cargar las bodegas: {error.message}
          </Typography>
        ) : (
          <WarehouseCardList warehouses={warehouses} onEdit={handleEditWarehouse} />
        )}
      </HomeContent>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        disableScrollLock={true}
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
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <WarehouseForm onClose={handleCloseDialog} />
        </Box>
      </Dialog>

      <SnackbarRoot />
    </>
  );
}