'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/login/action';
import { useDropshippingRoles, useAssignDropshippingRole } from 'src/auth/context/login/hooks';

import { ICON_ROL } from '../../resources/constants';

export default function AssignRoleStep({ onAssigned, onBack }) {
  const { user, checkUserSession, clearAuthUser } = useAuthContext();
  const userId = user?.id;

  const {
    data: roles = [],
    isLoading: loadingRoles,
    error: rolesError,
  } = useDropshippingRoles();

  const {
    mutateAsync: assignRole,
    isPending: assigning,
    error: assignError,
    reset: resetAssignMutation,
  } = useAssignDropshippingRole();

  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { perfil: null },
    mode: 'onChange',
  });

  const selectedRoleId = watch('perfil');

  useEffect(() => {
    if (roles.length === 1 && !selectedRoleId) {
      setValue('perfil', roles[0].id, { shouldValidate: true });
    }
  }, [roles, selectedRoleId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!userId) return;
    const roleId = Number(data.perfil);
    if (!roleId) return;
    await assignRole({ userId, roleId });
    await checkUserSession?.(); // refresca user con rol
    onAssigned?.();
  });

  const handleBack = async () => {
    // Importante: limpiar token y usuario para impedir acceso a home accidental
    await signOut();
    clearAuthUser();
    reset({ perfil: null });
    resetAssignMutation();
    onBack?.();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          onClick={handleBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          color="inherit"
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Stack spacing={2}>
        <Typography variant="subtitle2">Elige tu perfil</Typography>

        {loadingRoles && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loadingRoles && (
          <Controller
            name="perfil"
            control={control}
            rules={{ required: 'Debes seleccionar un perfil' }}
            render={({ field, fieldState }) => (
              <>
                <Box
                  sx={{
                    gap: 2,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${roles.length}, 1fr)`,
                  }}
                >
                  {roles?.map((item) => (
                    <Paper
                      component={ButtonBase}
                      variant="outlined"
                      key={item.code}
                      onClick={() => field.onChange(item.id)}
                      sx={{
                        p: 2.5,
                        borderRadius: 1,
                        typography: 'subtitle2',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        ...(item.id === field.value && {
                          borderWidth: 2,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        }),
                      }}
                    >
                      <Box sx={{ fontSize: 28, mb: 1 }}>
                        {ICON_ROL[item.code] || ICON_ROL['default']}
                      </Box>
                      {item.label}
                    </Paper>
                  ))}
                </Box>

                {fieldState.error && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </>
            )}
          />
        )}

        {!!rolesError && <Alert severity="error">No se pudieron cargar los roles.</Alert>}
        {!!assignError && (
          <Alert severity="error">
            {String(assignError?.message || assignError || 'Error asignando rol')}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={!selectedRoleId || assigning}
            onClick={onSubmit}
          >
            {assigning ? 'Asignando...' : 'Continuar'}
          </Button>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Si migraste desde otra plataforma, selecciona tu rol de Dropshipping para activar tu cuenta.
        </Typography>
      </Stack>
    </Box>
  );
}
