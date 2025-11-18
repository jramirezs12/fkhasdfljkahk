import * as z from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

export const UpdateUserSchema = z.object({
  displayName: z.string().min(1, { error: 'Name is required!' }),
  email: schemaUtils.email(),
  photoURL: schemaUtils.file({ error: 'Avatar is required!' }).optional().nullable(),
  // Nuevos campos de identificación
  identificationType: z.string().min(1, { error: 'Tipo de identificación es obligatorio!' }),
  identificationNumber: z.string().min(1, { error: 'Número de identificación es obligatorio!' }),
  phoneNumber: schemaUtils.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaUtils.nullableInput(z.string().min(1, { error: 'Country is required!' }), {
    error: 'Country is required!',
  }),
  address: z.string().min(1, { error: 'Address is required!' }),
  state: z.string().min(1, { error: 'State is required!' }),
  city: z.string().min(1, { error: 'City is required!' }),
  zipCode: z.string().min(1, { error: 'Zip code is required!' }),
  about: z.string().optional().default(''),
  isPublic: z.boolean().optional().default(false),
});

export function AccountGeneral() {
  const { user } = useAuthContext();

  const currentUser = useMemo(() => {
    const firstName = (user?.firstName ?? user?.firstname ?? '').trim();
    const lastName = (user?.lastName ?? user?.lastname ?? '').trim();

    const addr = user?.address ?? null;

    const countryCode = addr?.countryCode ?? addr?.countryId ?? null;
    const street = addr?.street || ''; // string ya normalizada en el AuthProvider
    const stateName = addr?.region?.name || addr?.region?.code || '';

    return {
      displayName: [firstName, lastName].filter(Boolean).join(' ') || user?.email || '',
      email: user?.email || '',
      photoURL: null,
      // Identificación desde AuthProvider
      identificationType: user?.identificationType || '',
      identificationNumber: user?.identificationNumber || '',
      // Contacto / Dirección
      phoneNumber: addr?.telephone || '',
      country: countryCode,
      address: street,
      state: stateName,
      city: addr?.city || '',
      zipCode: addr?.postcode || '',
      about: '',
      isPublic: false,
    };
  }, [user]);

  const defaultValues = {
    displayName: '',
    email: '',
    photoURL: null,
    identificationType: '',
    identificationNumber: '',
    phoneNumber: '',
    country: null,
    address: '',
    state: '',
    city: '',
    zipCode: '',
    about: '',
    isPublic: false,
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // TODO: Mutación para actualizar datos en backend
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Update success!');
      // console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="displayName" label="Nombre" />
              <Field.Text name="email" label="Correo electrónico" />
              <Field.Text name="identificationType" label="Tipo de identificación" />
              <Field.Text name="identificationNumber" label="Número de identificación" />
              <Field.Phone name="phoneNumber" label="Número de teléfono" />
              <Field.Text name="address" label="Dirección" />
              <Field.CountrySelect name="country" label="País" placeholder="Elegir un país" displayValue="code"/>
              <Field.Text name="state" label="Estado/región" />
              <Field.Text name="city" label="Ciudad" />
              <Field.Text name="zipCode" label="Código postal" />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
