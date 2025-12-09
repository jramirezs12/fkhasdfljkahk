'use client';

import * as z from 'zod';
import Cookies from 'js.cookie';
import { useBoolean } from 'minimal-shared/hooks';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Slide from '@mui/material/Slide';
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

import { useLogin } from 'src/hooks/useLogin';

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

import AssignRoleStep from './components/assign-role-step';

function isPhoneLike(val) {
  if (!val) return false;
  const digits = val.replace(/\D/g, '');
  return digits.length >= 7 && /^[+\d\s()-]+$/.test(val);
}
function stripSpaces(value) {
  return (value || '').replace(/\s+/g, '');
}
function stripSpacesIfNotPhone(value) {
  return isPhoneLike(value) ? value : stripSpaces(value);
}

export const SignInSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Correo o teléfono es obligatorio' })
    .refine((v) => isPhoneLike(v) || !/\s/.test(v), 'El correo no debe contener espacios'),
  password: z
    .string()
    .optional()
    .refine((v) => (v == null || v === '') || !/\s/.test(v), 'La contraseña no puede contener espacios'),
  remember: z.boolean().optional(),
});

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/home';

  const authStore = useAuthStore();
  const { checkUserSession, forceRoleSelection, user, clearAuthUser } = useAuthContext();

  // Paso UI: 'login' | 'assignRole'
  const [step, setStep] = useState('login');

  // Si ya hay usuario y necesita rol, siempre forzar step assignRole
  useEffect(() => {
    if (forceRoleSelection) {
      setStep('assignRole');
    }
  }, [forceRoleSelection]);

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
    setFlowLoading,
  } = useLoginPhoneStore();

  const loginMutation = useLogin();
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
      const sessionResult = await checkUserSession?.();
      if (sessionResult?.needsRole) {
        setFlowLoading(false);
        setStep('assignRole');
      } else {
        router.replace(returnTo);
        router.refresh();
      }
    },
  });

  const showPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState(null);

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    mode: 'onChange',
    defaultValues: { identifier: '', password: '', remember: true },
  });

  const { handleSubmit, setValue, formState: { isSubmitting } } = methods;
  const watchIdentifier = useWatch({ control: methods.control, name: 'identifier' });
  const watchPassword = useWatch({ control: methods.control, name: 'password' });

  // Guard: si user sin rol y estamos en assignRole, bloquear login (se puede limpiar token para permitir login distinto si así se desea)
  const blockLogin = forceRoleSelection && !!user;

  useEffect(() => {
    if (!watchIdentifier) return;
    if (!isPhoneLike(watchIdentifier) && /\s/.test(watchIdentifier)) {
      const cleaned = stripSpaces(watchIdentifier);
      if (cleaned !== watchIdentifier) setValue('identifier', cleaned, { shouldValidate: true });
    }
  }, [watchIdentifier, setValue]);

  useEffect(() => {
    if (!watchPassword) return;
    if (/\s/.test(watchPassword)) {
      const cleaned = stripSpaces(watchPassword);
      if (cleaned !== watchPassword) setValue('password', cleaned, { shouldValidate: true });
    }
  }, [watchPassword, setValue]);

  useEffect(() => {
    setFlowError(null);
    setErrorMessage(null);
  }, [setFlowError]);

  const onSubmit = handleSubmit(async (data) => {
    // Si ya hay usuario sin rol, impedir más logins hasta asignación o salir
    if (blockLogin) {
      setErrorMessage('Debes seleccionar un perfil antes de continuar.');
      setStep('assignRole');
      return;
    }

    const identifierRaw = data.identifier || '';
    const passwordRaw = data.password || '';

    const identifier = stripSpacesIfNotPhone(identifierRaw).trim();
    const password = stripSpaces(passwordRaw);

    setValue('identifier', identifier, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });

    if (isPhoneLike(identifier)) {
      setFlowError(null);
      setPhone(identifier);
      try {
        validatePhoneMutation.mutate({ phone: identifier });
        goToPhoneMode?.();
      } catch {
        setFlowError('Error al validar el teléfono.');
      }
      return;
    }

    if (!identifier.includes('@')) {
      setErrorMessage('Introduce un correo válido o un número de teléfono.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres y sin espacios.');
      return;
    }

    try {
      const token = await loginMutation.mutateAsync({ email: identifier, password });

      if (!token || typeof token !== 'string') {
        throw new Error('No se recibió token válido del servidor.');
      }

      authStore.setToken(token);
      Cookies.set('accessToken', token, { path: '/', sameSite: 'lax' });

      try {
        await setSession(token);
      } catch {
        sessionStorage.setItem(STORAGE_KEY, token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      const sessionCheck = await checkUserSession?.();
      if (sessionCheck?.needsRole) {
        setFlowLoading(false);
        setStep('assignRole');
      } else {
        router.replace(returnTo);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Usuario o contraseña no válidos.');
    }
  });

  // PhoneFlow implementation (was missing)
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
            <RadioGroup value={selectedUid} onChange={(e) => setSelectedUid(e.target.value)} sx={{ display: 'grid', gap: 1 }}>
              {accounts.map((acc) => (
                <FormControlLabel key={acc.uid} value={acc.uid} control={<Radio />} label={acc.email} />
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
              <Button fullWidth color="inherit" variant="outlined" onClick={backToPhoneStep} disabled={flowLoading} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                Cambiar número
              </Button>
              <Button fullWidth color="inherit" variant="outlined" onClick={backToEmailMode} disabled={flowLoading} startIcon={<Iconify icon="mdi:email-outline" />}>
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
              <Typography variant="caption" sx={{ color: otpRemaining ? 'text.secondary' : 'error.main' }}>
                {otpRemaining ? `El código expira en ${formatTime(otpRemaining)}` : 'El código ha expirado'}
              </Typography>
              <Link
                component="button"
                underline="always"
                onClick={otpRemaining === 0 && !flowLoading ? handleResendOtp : undefined}
                sx={{
                  cursor: otpRemaining === 0 && !flowLoading ? 'pointer' : 'default',
                  color: otpRemaining === 0 && !flowLoading ? 'primary.main' : 'text.disabled',
                  fontWeight: 'fontWeightMedium',
                  '&:hover': { textDecoration: otpRemaining === 0 && !flowLoading ? 'underline' : 'none' },
                }}
              >
                Reenviar código
              </Link>
            </Stack>

            <TextField label="Código de verificación" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" fullWidth InputLabelProps={{ shrink: true }} />

            {!!flowError && <Alert severity="error">{flowError}</Alert>}

            <Stack spacing={1}>
              <Button fullWidth variant="contained" onClick={handleValidateOtp} disabled={flowLoading} startIcon={<Iconify icon="mdi:check-circle-outline" />}>
                {flowLoading ? 'Validando...' : 'Confirmar código'}
              </Button>

              <Box>
                <Divider>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    o
                  </Typography>
                </Divider>
              </Box>

              <Button fullWidth color="inherit" variant="outlined" onClick={backToEmailMode} disabled={flowLoading} startIcon={<Iconify icon="mdi:swap-horizontal" />}>
                Elegir otro método
              </Button>
              <Button fullWidth color="inherit" variant="outlined" onClick={backToSelectOrPhone} disabled={flowLoading} startIcon={<Iconify icon="mdi:phone-edit" />}>
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
    validatePhoneMutation,
    setPhone,
    setSelectedUid,
    setOtpCode,
  ]);

  const EmailPasswordForm = useMemo(
    () => (
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={5} alignItems="center" sx={{ width: '100%' }}>
          <Typography variant="h4" sx={{ mt: 1, textAlign: 'center', fontWeight: 800, letterSpacing: '-0.2px' }}>
            Escribe tus datos
          </Typography>

          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <Stack spacing={4}>
              <Field.Text
                name="identifier"
                label="Correo electrónico o teléfono"
                disabled={blockLogin && step === 'assignRole'}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    onKeyDown: (e) => { if (e.key === ' ' && !isPhoneLike(e.currentTarget.value)) e.preventDefault(); },
                    onPaste: (e) => {
                      const pasted = (e.clipboardData.getData('text') || '').replace(/\s+/g, '');
                      if (!isPhoneLike(pasted) && pasted !== pasted.replace(/\s+/g, '')) {
                        e.preventDefault();
                        setValue('identifier', pasted, { shouldValidate: true });
                      }
                    },
                    onInput: (e) => {
                      const val = e.currentTarget.value;
                      if (!isPhoneLike(val) && /\s/.test(val)) {
                        const cleaned = stripSpaces(val);
                        e.currentTarget.value = cleaned;
                        setValue('identifier', cleaned, { shouldValidate: true });
                      }
                    },
                    autoComplete: 'email',
                  },
                }}
                fullWidth
              />

              <Field.Text
                name="password"
                label="Contraseña"
                type={showPassword.value ? 'text' : 'password'}
                disabled={blockLogin && step === 'assignRole'}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    onKeyDown: (e) => { if (e.key === ' ') e.preventDefault(); },
                    onPaste: (e) => {
                      const pasted = (e.clipboardData.getData('text') || '').replace(/\s+/g, '');
                      if (pasted !== pasted.replace(/\s+/g, '')) {
                        e.preventDefault();
                        setValue('password', pasted, { shouldValidate: true });
                      }
                    },
                    onInput: (e) => {
                      const val = e.currentTarget.value;
                      if (/\s/.test(val)) {
                        const cleaned = stripSpaces(val);
                        e.currentTarget.value = cleaned;
                        setValue('password', cleaned, { shouldValidate: true });
                      }
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={showPassword.onToggle} edge="end">
                          <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    autoComplete: 'current-password',
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
                loading={step === 'login' && !blockLogin && (isSubmitting || loginMutation.isPending)}
                disabled={blockLogin && step === 'assignRole'}
                startIcon={<Iconify icon="mdi:login" />}
                loadingIndicator="Iniciando sesión..."
              >
                {blockLogin && step === 'assignRole' ? 'Selecciona un perfil' : 'Ingresar'}
              </Button>

              {!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">¿Olvidaste tu contraseña?</Typography>
                <Link component={RouterLink} href={paths.auth.recoverPassword ?? '#'} underline="hover" sx={{ color: 'primary.main', typography: 'caption' }}>
                  Recuperala
                </Link>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <FormControlLabel control={<Checkbox defaultChecked />} label="Mantener la sesión abierta" />
              </Box>

              <Box>
                <Divider><Typography variant="caption" sx={{ color: 'text.secondary' }}>o</Typography></Divider>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">¿No tienes una cuenta?</Typography>
                <Link component={RouterLink} href={paths.auth.register ?? '#'} underline="hover" sx={{ color: 'primary.main', typography: 'body2' }}>
                  Registrate
                </Link>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Form>
    ),
    [methods, onSubmit, isSubmitting, loginMutation.isPending, step, showPassword.value, showPassword.onToggle, errorMessage, setValue, blockLogin]
  );

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Slide in={step === 'login'} direction="right" mountOnEnter unmountOnExit>
        <Box>{mode === 'email' ? EmailPasswordForm : PhoneFlow}</Box>
      </Slide>
      <Slide in={step === 'assignRole'} direction="left" mountOnEnter unmountOnExit>
        <Box sx={{ width: '100%' }}>
          <AssignRoleStep
            onBack={() => {
              // Al volver: limpiar usuario y token para evitar sesión sin rol
              clearAuthUser();
              setFlowLoading(false);
              setStep('login');
            }}
            onAssigned={() => {
              router.replace(returnTo);
              router.refresh();
            }}
          />
        </Box>
      </Slide>
    </Box>
  );
}
