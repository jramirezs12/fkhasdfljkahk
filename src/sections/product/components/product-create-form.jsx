import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useGetCategories } from 'src/actions/category/category';
import { useGetWarehouses } from 'src/actions/warehouses/warehouses';
import { useCreateProduct } from 'src/actions/product/useCreateProduct';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { getErrorMessage } from 'src/sections/utils';

export const SignUpSchema = z.object({
  nombre: z.string().min(1, { message: 'Nombre es obligatorio!' }),
  categoryId: z.preprocess(
    (val) => String(val ?? ''),
    z.string().min(1, { message: 'Categoría es obligatorio!' })
  ),
  sucursal: z.preprocess(
    (val) => String(val ?? ''),
    z.string().min(1, { message: 'Sucursal es obligatorio!' })
  ),
  sku: z.string()
    .min(1, { message: 'SKU es obligatorio!' })
    .max(10, { message: 'SKU no debe exceder 10 dígitos' })
    .regex(/^[A-Za-z0-9-]+$/, { message: 'Solo se permiten letras, números y guiones. No se permiten espacios.' }),
  precio: z.preprocess(
    (val) => String(val ?? ''),
    z.string()
      .min(1, { message: 'Precio es obligatorio!' })
      .max(10, { message: 'Precio no debe exceder 10 digitos' })
      .regex(/^\d+$/, { message: 'Solo se permiten números' })
  ),
  stock: z.preprocess(
    (val) => String(val ?? ''),
    z.string()
      .min(1, { message: 'Existencias es obligatorio!' })
      .max(10, { message: 'Existencias no debe exceder 10 digitos' })
      .regex(/^\d+$/, { message: 'Solo se permiten números' })
  ),
  descripcionCorta: z.string().min(10, { message: 'Descripción corta es obligatorio!' }),
  descripcion: z.string().min(10, { message: 'Descripción es obligatorio!' }),
  imagenes: z.array(z.any()).nonempty({ message: 'Debes cargar al menos una imagen PNG menor a 5MB' }),
});

export function ProductCreateForm() {
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const { mutateAsync } = useCreateProduct();
  const { categoriesOptions, categoriesLoading } = useGetCategories();
  const { data: warehousesList, isLoading: loadingWarehouses } = useGetWarehouses();

  const defaultValues = {
    nombre: '',
    categoryId: '',
    sucursal: '',
    sku: '',
    precio: '',
    stock: '',
    descripcionCorta: '',
    descripcion: '',
    imagenes: [],
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    watch,
  } = methods;

  const values = watch();

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.imagenes && values.imagenes?.filter((file) => file !== inputFile);
      setValue('imagenes', filtered, { shouldValidate: true });
    },
    [setValue, values.imagenes]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('imagenes', [], { shouldValidate: true });
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('FORM DATA SUBMIT:', data);

    if (!Array.isArray(data.imagenes) || data.imagenes.length === 0) {
      setErrorMessage('Debes cargar al menos una imagen PNG menor a 500KB');
      return;
    }

    const validFiles = data.imagenes.filter(file =>
      file.type === 'image/png' && file.size <= 0.5 * 1024 * 1024
    );
    if (validFiles.length === 0) {
      setErrorMessage('Las imágenes deben ser PNG y menores a 5MB');
      return;
    }

    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const filesBase64 = await Promise.all(validFiles.map(toBase64));
    const cleanBase64Array = filesBase64.map(str => str.replace(/^data:image\/png;base64,/, ''));

    try {
      await mutateAsync({
        name: data.nombre,
        categoryId: data.categoryId,
        warehouse: data.sucursal,
        sku: data.sku,
        price: data.precio,
        stock: data.stock,
        shortDescription: data.descripcionCorta,
        description: data.descripcion,
        images: cleanBase64Array,
        files: validFiles
      });

      toast.success('¡El producto se creó correctamente!', {
        action: {
          label: 'Ver',
          onClick: () => {
            setTimeout(() => {
              router.push(paths.home.product.details(data.sku));
            }, 100);
          }
        },
      });
      setErrorMessage(null);
      methods.reset();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el producto.');
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{
      gap: 3,
      display: 'flex',
      flexDirection: 'column',
      gridTemplateColumns: { md: '2fr' }
    }}>

      <Card>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Field.Text
              name="nombre"
              label="Nombre de producto"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Field.Select
              name="categoryId"
              label="Categoria"
              slotProps={{ inputLabel: { shrink: true } }}
            >
              <MenuItem value="">
                <em>Seleccione</em>
              </MenuItem>
              {!categoriesLoading &&
                categoriesOptions?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
            </Field.Select>
            <Field.Select
              name="sucursal"
              label="Sucursal"
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={loadingWarehouses}
            >
              <MenuItem value="">
                <em>Seleccione</em>
              </MenuItem>
              {!loadingWarehouses &&
                warehousesList?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
            </Field.Select>
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 3, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Field.Text
              name="sku"
              label="SKU"
              slotProps={{ inputLabel: { shrink: true } }}
              max="10"
              inputProps={{ maxLength: 10 }}
            />
            <Field.Text
              name="precio"
              label="Precio"
              type="number"
              slotProps={{ inputLabel: { shrink: true } }}
              max="10"
              inputProps={{ maxLength: 10 }}
            />
            <Field.Text
              name="stock"
              label="Existencias"
              type="number"
              slotProps={{ inputLabel: { shrink: true } }}
              max="10"
              inputProps={{ maxLength: 10 }}
            />
          </Box>

          <Field.Text name="descripcionCorta" label="Descripción corta" multiline rows={4} />

          <Typography variant="descripcion">Descripción del producto</Typography>
          <Field.Editor name="descripcion" sx={{ maxHeight: 400 }} />

          <Stack spacing={1.5}>
            <Typography variant="imagenes">Imágenes</Typography>
            <Field.Upload
              multiple
              name="imagenes"
              accept={{ 'image/png': [] }}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAllFiles}
            />
          </Stack>

          {!!errorMessage && (
            <Alert severity="error" sx={{ mb: 0 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Creando producto..."
          >
            Crear producto
          </Button>
        </Stack>
      </Card>

    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {renderForm()}
    </Form>
  );
}
