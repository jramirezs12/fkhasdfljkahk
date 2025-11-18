'use client';

import * as z from 'zod';
import Cookies from 'js.cookie';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
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
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { setSession } from 'src/auth/context/login/utils';
import { STORAGE_KEY } from 'src/auth/context/login/constant';
import {
  useCreateOtpMutation,
  useValidateOtpMutation,
  useValidatePhoneMutation,
} from 'src/auth/context/login/hooks';


// ================= Schema =================================
// Ahora el campo identifier acepta correo o teléfono (se valida en runtime)
export const SignInSchema = z.object({
  identifier: z.string().min(1, { message: 'Correo o teléfono es obligatorio' }),
  password: z.string().optional(),
  remember: z.boolean().optional(),
});

// ================ Helpers formato =================
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function isPhoneLike(val) {
  if (!val) return false;
  // admite signos +, espacios, paréntesis y dígitos; mínimo 7 caracteres numéricos
  const digits = val.replace(/\D/g, '');
  return digits.length >= 7 && /^[+\d\s()-]+$/.test(val);
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
        sessionStorage.setItem(STORAGE_KEY, token);
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
    defaultValues: { identifier: '', password: '', remember: true },
  });
  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Si el product (o props externos) actualizan phone store, sincronizar si necesario:
  useEffect(() => {
    // limpiar errores visuales al montar
    setFlowError(null);
    setErrorMessage(null);
  }, [setFlowError]);

  // Lógica cuando el usuario envía el formulario principal.
  // Si puso un teléfono, iniciamos automáticamente validación / OTP.
  // Si puso un correo usamos login password.
  const onSubmit = handleSubmit(async (data) => {
    const identifier = (data.identifier || '').trim();

    if (isPhoneLike(identifier)) {
      // Iniciamos flujo OTP automáticamente
      setFlowError(null);
      setPhone(identifier);
      try {
        validatePhoneMutation.mutate({ phone: identifier });
        // Pasamos a modo teléfono para que el UI del flujo teléfono maneje la selección / otp
        goToPhoneMode?.();
      } catch {
        setFlowError('Error al validar el teléfono.');
      }
      return;
    }

    // Si no es teléfono se espera correo + contraseña
    if (!identifier.includes('@')) {
      setErrorMessage('Introduce un correo válido o un número de teléfono.');
      return;
    }

    if (!data.password || data.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const token = await loginPasswordMutate({ email: identifier, password: data.password });
      authStore.setToken(token);
      Cookies.set('accessToken', token, { path: '/', sameSite: 'lax' });
      try {
        await setSession(token);
      } catch {
        sessionStorage.setItem(STORAGE_KEY, token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      await checkUserSession?.();
      router.replace(returnTo);
      router.refresh();
    } catch {
      setErrorMessage('Usuario o contraseña no válidos.');
    }
  });

  // Acciones flujo teléfono (reutilizamos handlers existentes)
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

  // Form email/password UI (reordenado y con nuevo header)
  const EmailPasswordForm = useMemo(
    () => (
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={5} alignItems="center" sx={{ width: '100%' }}>
          {/* Título centrado (más grande y en negrilla) */}
          <Typography
            variant="h4"
            sx={{ mt: 1, textAlign: 'center', fontWeight: 800, letterSpacing: '-0.2px' }}
          >
            Escribe tus datos
          </Typography>

          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Agrupamos campos y les damos más espacio */}
            <Stack spacing={4}>
              <Field.Text
                name="identifier"
                label="Correo electrónico o teléfono"
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />

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
                fullWidth
              />

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

              {/* Row: forgot + action */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  ¿Olvidaste tu contraseña?
                </Typography>
                <Link component={RouterLink} href={paths.auth.recoverPassword ?? '#'} underline="hover" sx={{ color: 'primary.main', typography: 'caption' }}>
                  Recuperala
                </Link>
              </Box>

              {/* Mantener sesión abierta - centrado */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="Mantener la sesión abierta"
                />
              </Box>

              {/* Error general */}
              {!!errorMessage && (
                <Alert severity="error">
                  {errorMessage}
                </Alert>
              )}

              <Box>
                <Divider>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    o
                  </Typography>
                </Divider>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?
                </Typography>
                <Link component={RouterLink} href={paths.auth.register ?? '#'} underline="hover" sx={{ color: 'primary.main', typography: 'body2' }}>
                  Registrate
                </Link>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Form>
    ),
    [
      methods,
      onSubmit,
      isSubmitting,
      showPassword.value,
      showPassword.onToggle,
      errorMessage,
    ]
  );

  // Flow teléfono UI (sin botón para iniciarlo: se abre automáticamente cuando detectamos teléfono)
  const PhoneFlow = useMemo(() => {
    const containerSx = { width: '100%', maxWidth: 420, mx: 'auto' };

    if (phoneStep === 'phone') {
      return (
        <Box sx={containerSx}>
          <Stack spacing={3}>
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
              onClick={() => validatePhoneMutation.mutate({ phone })}
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
          </Stack>
        </Box>
      );
    }

    if (phoneStep === 'select') {
      return (
        <Box sx={containerSx}>
          <Stack spacing={3}>
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
          </Stack>
        </Box>
      );
    }

    if (phoneStep === 'otp') {
      return (
        <Box sx={containerSx}>
          <Stack spacing={3}>
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

              <Box>
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
    handleSelectAccountAndGenerateOtp,
    handleResendOtp,
    handleValidateOtp,
    backToEmailMode,
    backToPhoneStep,
    backToSelectOrPhone,
    setPhone,
    setSelectedUid,
    setOtpCode,
    validatePhoneMutation,
  ]);

  return (
    <>
      {/* Si el store está en modo email mostramos el formulario reestructurado.
          Si el store cambió a modo teléfono (por el auto-detect) mostramos el PhoneFlow. */}
      {mode === 'email' ? EmailPasswordForm : PhoneFlow}
    </>
  );
}
