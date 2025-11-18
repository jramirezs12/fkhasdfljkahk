'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useGetCities } from 'src/actions/order/order';
import { fetchShippingQuote } from 'src/actions/product/shipping-quote';
import { placeOrder, addDataToCart, createGuestCart, assignWarehouseOrder } from 'src/actions/order/cart';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { STORAGE_KEY } from 'src/auth/context/login/constant';

import { QuoterForm } from '../components/quoter-form';
import { OrderSummary } from '../components/order-summary';
import { ClientDataForm } from '../components/client-data-form';
import { ProductOrderForm } from '../components/product-order-form';

export const CreateOrderSchema = z.object({
  names: z.string().min(1, 'El nombre es obligatorio'),
  lastnames: z.string().min(1, 'El apellido es obligatorio'),
  phoneNumber: z.string().min(7, 'El teléfono es obligatorio'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  email: z.string().email('Correo inválido'),
  address: z.string().min(1, 'La dirección es obligatoria'),
});

export function CreateOrderModal({ product, open, onClose }) {
  const providerPriceUnit = Number(product?.providerPrice ?? 0);
  const providerPrice = providerPriceUnit;

  const initialDropperPrice = Number(product?.providerPrice ?? 0);

  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      names: '',
      lastnames: '',
      phoneNumber: '+57',
      city: '',
      email: '',
      address: '',
      complemento: '',
      addressType: 'casa',
      paymentMode: 'casa',
      carrier: 'inter_rapidisimo',
      dropperPrice: initialDropperPrice,
      providerPrice,
      quantity: 1,
      shippingBase: 0,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = methods;

  const { citiesOptions = [] } = useGetCities();

  const watchedCity = watch('city');
  const watchedQuantity = Number(watch('quantity') || 1);

  const debounceRef = useRef(null);

  // Cotización de envío (guest, sin token)
  useEffect(() => {
    let mounted = true;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setValue('shippingBase', 0, { shouldDirty: true });

    if (!product?.id || !watchedCity) {
      setShippingLoading(false);
      setShippingError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const found = (citiesOptions || []).find((c) => String(c.value) === String(watchedCity));
      const destinationCityName = found ? String(found.label) : String(watchedCity);

      try {
        setShippingLoading(true);
        setShippingError(null);
        const quote = await fetchShippingQuote(destinationCityName, Number(product.id), Number(watchedQuantity));
        if (!mounted) return;
        setValue('shippingBase', Number(quote.price || 0), { shouldDirty: true });
      } catch (err) {
        console.error('Error al obtener cotización de envío:', err);
        if (!mounted) return;
        setShippingError(typeof err === 'string' ? err : err?.message ?? 'No se pudo cotizar el envío');
        setValue('shippingBase', 0, { shouldDirty: true });
      } finally {
        if (mounted) setShippingLoading(false);
      }
    }, 300);

    // eslint-disable-next-line consistent-return
    return () => {
      mounted = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [watchedCity, watchedQuantity, product?.id, setValue, citiesOptions]);

  const watchedPrice = Number(watch('dropperPrice') || 0);

  // Validación mínima: precio >= proveedor
  const priceValid = (() => {
    if (Number.isNaN(watchedPrice)) return false;
    if (watchedPrice < providerPrice) return false;
    return true;
  })();

  function sanitizePhone(val) {
    if (!val) return '';
    return String(val).replace(/\D/g, '');
  }

  const onSubmit = handleSubmit(async (formData) => {
    setSubmitting(true);
    try {
      // 1) Crear carrito invitado
      const cartId = await createGuestCart();

      // 2) Resolver ciudad y región
      const cityOpt = (citiesOptions || []).find((c) => String(c.value) === String(formData.city));
      const cityName = cityOpt?.label || '';
      const regionId = Number(cityOpt?.regionId || 0);

      // 3) Preparar datos para el carrito
      const sku = product?.sku || '';
      const quantity = Number(formData.quantity || 1);
      const dropper_price = Number(formData.dropperPrice || 0);
      const firstname = formData.names?.trim() || 'Cliente';
      const lastname = formData.lastnames?.trim() || 'Invitado';

      const telephone = sanitizePhone(formData.phoneNumber);
      const street = [formData.address, formData.complemento].filter(Boolean);

      const email = formData.email;

      // Carrier y método (según tu backend)
      const carrier_code = 'envios';
      const method_code = 'inter';

      // Método de pago (de ejemplo, se puede condicionar por paymentMode)
      const payment_code = 'cashondelivery';

      // 4) Agregar productos, direcciones, método de envío/pago y email al carrito (guest, sin token)
      await addDataToCart({
        cartId,
        quantity,
        sku,
        dropper_price,
        firstname,
        lastname,
        street,
        city: cityName,
        region_id: regionId,
        telephone,
        email,
        carrier_code,
        method_code,
        payment_code,
      });

      // 5) Place Order (guest)
      const magentoOrderId = await placeOrder(cartId);

      // 6) Assign Warehouse Order (CON TOKEN)
      const token =
        typeof window !== 'undefined'
          ? window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY)
          : null;

      if (!token) {
        // Si no hay token, se puede continuar sin asignar, o mostrar advertencia
        console.warn('No hay token disponible para asignar la orden al warehouse. Saltando ASSIGN_WAREHOUSE_ORDER.');
      } else {
        await assignWarehouseOrder(magentoOrderId, token);
      }

      // 7) Mostrar snackbar de éxito y cerrar modal
      toast.success(`Orden creada correctamente: ${magentoOrderId}`);

      onClose?.();
    } catch (err) {
      console.error('Error en flujo de creación de orden:', err);
      const message = typeof err === 'string' ? err : err?.message ?? 'Ocurrió un error al crear la orden';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
            width: { xs: '92vw', sm: '88vw', md: '78vw', lg: '74vw', xl: '70vw' },
            maxWidth: 'none',
            maxHeight: '92vh',
            overflow: 'hidden',
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle>Crear orden manual</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent
          sx={{
            p: 2,
            pt: 1,
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(0, 3fr) minmax(0, 3fr) minmax(0, 4fr)',
              },
              alignItems: 'start',
              overflow: 'hidden',
            }}
          >
            <ClientDataForm />
            <QuoterForm />
            <Box sx={{ display: 'grid', gap: 2 }}>
              <ProductOrderForm product={product} />
              <OrderSummary />
              {shippingLoading && (
                <Box sx={{ typography: 'caption', color: 'text.secondary' }}>Cotizando envío...</Box>
              )}
              {!!shippingError && (
                <Box sx={{ typography: 'caption', color: 'error.main' }}>{shippingError}</Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button variant="outlined" onClick={onClose} size="small" disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!isValid || !priceValid || submitting}
          >
            {submitting ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
