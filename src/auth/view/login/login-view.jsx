'use client';

import * as z from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useLogin } from 'src/hooks/useLogin';

import { useAuthStore } from 'src/store/authStore';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export const SignInSchema = z.object({
  email: schemaUtils.email(),
  password: z
    .string()
    .min(1, { message: 'Contraseña es obligatorio!' })
    .min(6, { message: 'Contraseña tener al menos 6 caracteres!' }),
});

// ----------------------------------------------------------------------

export default function LoginView() {
  const router = useRouter();

    const defaultValues = {
    email: '',
    password: ''
  };
  const { mutateAsync } = useLogin();
  const setToken = useAuthStore((state) => state.setToken);

  const showPassword = useBoolean();

  const [errorMessage, setErrorMessage] = useState(null);

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await mutateAsync({ email: data.email, password: data.password });
      setToken(token);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="email" label="Correo electrónico" slotProps={{ inputLabel: { shrink: true } }} />

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
          placeholder=""
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
        loadingIndicator="Iniciando sesión..."
      >
        Ingresar
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Ingresa a tu cuenta"
        description={
          <>
            Si aún no tienes una cuenta
            <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
              Regístrate aquí
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
