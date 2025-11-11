'use client';

/**
 * LoginView
 * -----------------------------------------------------------------------------
 * Vista de autenticación con:
 *  - Login por correo/contraseña.
 *  - Login por teléfono con flujo: ingresar número -> seleccionar cuenta (si varias)
 *    -> código OTP con temporizador y reenvío.
 *  - Uso de Zustand (loginPhoneStore) para estado del flujo teléfono.
 *  - Uso de TanStack Query (mutations) para llamadas GraphQL (validate phone, create OTP, validate OTP).
 *  - Mensajes de error y loading centralizados.
 */

import * as z from 'zod';
import Cookies from 'js.cookie';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import RadioGroup from '@mui/material/RadioGroup';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useLogin } from 'src/hooks/useLogin'; // Hook existente para login email/contraseña

import axios from 'src/lib/axios';
import { useAuthStore } from 'src/store/authStore';
import { useLoginPhoneStore } from 'src/store/loginPhoneStore';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { setSession } from 'src/auth/context/jwt/utils';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import {
  useCreateOtpMutation,
  useValidateOtpMutation,
  useValidatePhoneMutation,
} from 'src/auth/context/login/hooks';

import { FormHead } from '../../components/form-head';

// ================= Schema email/password =================
export const SignInSchema = z.object({
  email: schemaUtils.email(),
  password: z
    .string()
    .min(1, { message: 'Contraseña es obligatoria!' })
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres!' }),
});

// ================ Helpers formato =================
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ===================================================================
export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/home';

  const authStore = useAuthStore();
  const { checkUserSession } = useAuthContext();

  // Store (Zustand) del flujo teléfono
  const {
    mode,
    phoneStep,
    phone,
    accounts,
    selectedUid,
    otpCode,
    otpRemaining,
    flowError,
    flowLoading,
    setPhone,
    setOtpCode,
    setSelectedUid,
    setFlowError,
    goToPhoneMode,
    backToEmailMode,
    backToPhoneStep,
    backToSelectOrPhone,
  } = useLoginPhoneStore();

  // Hook login email/password (mantienes tu propio hook)
  const { mutateAsync: loginPasswordMutate } = useLogin();

  // Mutations React Query
  const validatePhoneMutation = useValidatePhoneMutation();
  const createOtpMutation = useCreateOtpMutation();
  const validateOtpMutation = useValidateOtpMutation({
    onSuccessLogin: async (token) => {
      try {
        await setSession(token);
      } catch {
        sessionStorage.setItem(JWT_STORAGE_KEY, token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      await checkUserSession?.();
      router.replace(returnTo);
      router.refresh();
    },
  });

  // Email/password form
  const showPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState(null);

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmitEmail = handleSubmit(async (data) => {
    try {
      const token = await loginPasswordMutate({ email: data.email, password: data.password });
      authStore.setToken(token);
      Cookies.set('accessToken', token, { path: '/', sameSite: 'lax' });
      try {
        await setSession(token);
      } catch {
        sessionStorage.setItem(JWT_STORAGE_KEY, token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      await checkUserSession?.();
      router.replace(returnTo);
      router.refresh();
    } catch (error) {
      // Mensaje fijo solicitado
      setErrorMessage('Usuario o contraseña no válidos.');
    }
  });

  // Acciones flujo teléfono
  const handleValidatePhone = useCallback(() => {
    validatePhoneMutation.mutate({ phone });
  }, [validatePhoneMutation, phone]);

  const handleSelectAccountAndGenerateOtp = useCallback(() => {
    if (!selectedUid) {
      setFlowError('Selecciona una cuenta.');
      return;
    }
    createOtpMutation.mutate({ uid: selectedUid, phone });
  }, [selectedUid, phone, createOtpMutation, setFlowError]);

  const handleResendOtp = useCallback(() => {
    if (otpRemaining > 0 || !selectedUid) return;
    createOtpMutation.mutate({ uid: selectedUid, phone });
  }, [otpRemaining, selectedUid, phone, createOtpMutation]);

  const handleValidateOtp = useCallback(() => {
    validateOtpMutation.mutate({ uid: selectedUid, code: otpCode });
  }, [selectedUid, otpCode, validateOtpMutation]);

  // Form email/password UI
  const EmailPasswordForm = useMemo(
    () => (
      <Form methods={methods} onSubmit={onSubmitEmail}>
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="email"
            label="Correo electrónico"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
            <Link
              component={RouterLink}
              href="#"
              variant="body2"
              color="inherit"
              sx={{ alignSelf: 'flex-end' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Field.Text
              name="password"
              label="Contraseña"
              type={showPassword.value ? 'text' : 'password'}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showPassword.onToggle} edge="end">
                        <Iconify
                          icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="mdi:login" />}
            loadingIndicator="Iniciando sesión..."
          >
            Ingresar
          </Button>

          {!!errorMessage && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ my: 1 }}>
            <Divider>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                o
              </Typography>
            </Divider>
          </Box>

          <Button
            fullWidth
            size="large"
            type="button"
            variant="contained"
            color="primary"
            onClick={goToPhoneMode}
            startIcon={<Iconify icon="solar:phone-bold" />}
          >
            Continuar con número de teléfono
          </Button>
        </Box>
      </Form>
    ),
    [methods, onSubmitEmail, isSubmitting, showPassword.value, showPassword.onToggle, goToPhoneMode, errorMessage]
  );

  // Flow teléfono UI
  const PhoneFlow = useMemo(() => {
    if (phoneStep === 'phone') {
      return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <TextField
            label="Número de teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="321 123456"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {!!flowError && <Alert severity="error">{flowError}</Alert>}
          <Button
            fullWidth
            variant="contained"
            onClick={handleValidatePhone}
            disabled={flowLoading}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {flowLoading ? 'Validando...' : 'Continuar'}
          </Button>
          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={backToEmailMode}
            disabled={flowLoading}
            startIcon={<Iconify icon="mdi:email-outline" />}
          >
            Volver al correo
          </Button>
        </Box>
      );
    }

    if (phoneStep === 'select') {
      return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Selecciona la cuenta asociada a tu número:
          </Typography>
          <RadioGroup
            value={selectedUid}
            onChange={(e) => setSelectedUid(e.target.value)}
            sx={{ display: 'grid', gap: 1 }}
          >
            {accounts.map((acc) => (
              <FormControlLabel
                key={acc.uid}
                value={acc.uid}
                control={<Radio />}
                label={acc.email}
              />
            ))}
          </RadioGroup>
          {!!flowError && <Alert severity="error">{flowError}</Alert>}
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSelectAccountAndGenerateOtp}
              disabled={flowLoading}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              {flowLoading ? 'Generando código...' : 'Continuar'}
            </Button>
            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={backToPhoneStep}
              disabled={flowLoading}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            >
              Cambiar número
            </Button>
            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={backToEmailMode}
              disabled={flowLoading}
              startIcon={<Iconify icon="mdi:email-outline" />}
            >
              Volver al correo
            </Button>
          </Stack>
        </Box>
      );
    }

    if (phoneStep === 'otp') {
      return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="caption"
              sx={{ color: otpRemaining ? 'text.secondary' : 'error.main' }}
            >
              {otpRemaining
                ? `El código expira en ${formatTime(otpRemaining)}`
                : 'El código ha expirado'}
            </Typography>
            <Link
              component="button"
              underline="always"
              onClick={otpRemaining === 0 && !flowLoading ? handleResendOtp : undefined}
              sx={{
                cursor: otpRemaining === 0 && !flowLoading ? 'pointer' : 'default',
                color: otpRemaining === 0 && !flowLoading ? 'primary.main' : 'text.disabled',
                fontWeight: 'fontWeightMedium',
                '&:hover': {
                  textDecoration: otpRemaining === 0 && !flowLoading ? 'underline' : 'none',
                },
              }}
            >
              Reenviar código
            </Link>
          </Stack>

          <TextField
            label="Código de verificación"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {!!flowError && <Alert severity="error">{flowError}</Alert>}

          <Stack spacing={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleValidateOtp}
              disabled={flowLoading}
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
            >
              {flowLoading ? 'Validando...' : 'Confirmar código'}
            </Button>

            <Box sx={{ my: 1 }}>
              <Divider>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  o
                </Typography>
              </Divider>
            </Box>

            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={backToEmailMode}
              disabled={flowLoading}
              startIcon={<Iconify icon="mdi:swap-horizontal" />}
            >
              Elegir otro método
            </Button>
            <Button
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={backToSelectOrPhone}
              disabled={flowLoading}
              startIcon={<Iconify icon="mdi:phone-edit" />}
            >
              Cambiar número de teléfono
            </Button>
          </Stack>
        </Box>
      );
    }

    return null;
  }, [
    phoneStep,
    phone,
    accounts,
    selectedUid,
    otpCode,
    otpRemaining,
    flowError,
    flowLoading,
    handleValidatePhone,
    handleSelectAccountAndGenerateOtp,
    handleResendOtp,
    handleValidateOtp,
    backToEmailMode,
    backToPhoneStep,
    backToSelectOrPhone,
    setPhone,
    setSelectedUid,
    setOtpCode,
  ]);

  return (
    <>
      {mode === 'email' && (
        <FormHead
          title="Ingresa a tu cuenta"
          description={
            <>
              Si aún no tienes una cuenta
              <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
                &nbsp;Regístrate aquí
              </Link>
            </>
          }
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
      )}

      {mode === 'email' ? EmailPasswordForm : PhoneFlow}
    </>
  );
}
