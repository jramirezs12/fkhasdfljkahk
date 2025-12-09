'use client';

import { useState, useEffect } from 'react';

import { Dialog } from '@mui/material';
import Button from '@mui/material/Button';
//import { Box, Dialog, Typography, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CHANGE_WAREHOUSE_STATUS } from 'src/hooks/warehouse/mutations';
import { useGetWarehouseFix } from 'src/hooks/warehouse/useGetWarehouseFix';

import { HomeContent } from 'src/layouts/home';
import { requestGql } from 'src/lib/graphqlRequest';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ErrorContent } from 'src/components/error-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { PermissionContent } from 'src/components/permission-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { WarehouseCardList } from '../components/warehouse-card-list';
import { WarehouseCreateForm } from '../components/warehouse-create-form';

export function WarehouseListView() {
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user === null) {
      router.replace(paths.auth.login);
    }
  }, [user, router]);

  const [openDialog, setOpenDialog] = useState(false);
  const { warehouses, isLoading, error, refetch } = useGetWarehouseFix();

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

  /*
  const handleDeleteWarehouse = async (id) => {
    try {
      await requestGql('ChangeWarehouseStatus', CHANGE_WAREHOUSE_STATUS, { id });
      toast.success(`Sucursal ${currentStatus === 'active' ? 'inhabilitada' : 'habilitada'} correctamente`);
      refetch();

    } catch (e) {
      console.error(e);
      toast.error('No se pudo actualizar el estado de la sucursal');
    }
  };
  */

  if (user === null) {
    return null;
  } else if (user.dropshipping === null || user.dropshipping.status !== 'approved') {
    return (
      <HomeContent>
        <PermissionContent
          title="Acceso denegado"
          description="No tienes permiso para ver las sucursales. Tu cuenta está pendiente de aprobación."
          sx={{ mt: 10 }}
        />
      </HomeContent>
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  if (error) {
    return (
      <ErrorContent
        title="Sucursales no disponibles"
        description="Lo sentimos, no pudimos cargar las sucursales en este momento. Por favor, intenta nuevamente más tarde."
        sx={{ mt: 2 }}
      />
    );
  }

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
        {
          !warehouses || warehouses.length === 0 ? (
            <EmptyContent
              filled
              title="No hay sucursales"
              description="Crea una sucursal para comenzar a gestionarlas."
              action={
                <Button
                  component={RouterLink}
                  href={paths.home.root}
                  size='medium'
                  variant="contained"
                  sx={{ mt: 4 }}>
                  Ir al inicio
                </Button>
              }
              sx={{ pt: 2, height: 'auto', flexGrow: 'unset' }}
            />
          ) : (
            <WarehouseCardList warehouses={warehouses} onToggleActive={handleToggleActive} />
          )
        }
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