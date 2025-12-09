'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useGetCities } from 'src/actions/order/order'; // re-export -> canonical hook
import {
  usePlaceOrder,
  useAddDataToCart,
  useCreateGuestCart,
  useAssignWarehouseOrder,
} from 'src/actions/order/cart';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

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
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  const providerPriceUnit = Number(product?.providerPrice ?? 0);
  const providerPrice = providerPriceUnit;
  // set initial dropper price to the 1.8x suggested price so the form is valid by default
  const initialDropperPrice = Math.round(providerPrice * 1.8 * 100) / 100;

  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

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
      // quoter results (populated by QuoterForm)
      grandTotal: 0,
      providerTotal: 0,
      shippingTotal: 0,
      commissionTotal: 0,
      profitTotal: 0,
      shippingBase: 0,
    },
  });

  const {
    handleSubmit,
    watch,
  } = methods;

  const { citiesOptions = [] } = useGetCities();

  const watchedCity = watch('city');
  const watchedNames = watch('names');
  const watchedLastnames = watch('lastnames');
  const watchedPhone = watch('phoneNumber');
  const watchedEmail = watch('email');
  const watchedAddress = watch('address');
  const watchedQuantity = Number(watch('quantity') || 0);
  const watchedPrice = Number(watch('dropperPrice') || NaN);

  const lastCityRef = useRef(''); // persist last non-empty city

  useEffect(() => {
    const c = String(watchedCity || '').trim();
    if (c) lastCityRef.current = c;
  }, [watchedCity]);

  const availableStock = Number(
    product?.available ??
      product?.availableStock ??
      product?.stock ??
      product?.inventory?.qty ??
      product?.inventory?.quantity ??
      product?.qty ??
      0
  );

  // price/quantity validation (client-side rules for input validity)
  const minAllowed = Math.round(providerPrice * 1.8 * 100) / 100;
  const priceValid = !Number.isNaN(watchedPrice) && watchedPrice >= minAllowed;

  const quantityValid = (() => {
    const q = Number(watchedQuantity || 0);
    if (Number.isNaN(q) || q < 1) return false;
    if (availableStock <= 0) return false;
    return q <= availableStock;
  })();

  // gate for submit: require client fields and that quoter produced values (grandTotal > 0)
  useEffect(() => {
    const stringsOk =
      String(watchedNames || '').trim() &&
      String(watchedLastnames || '').trim() &&
      String(watchedPhone || '').trim() &&
      (String(watchedCity || '').trim() || lastCityRef.current) &&
      String(watchedEmail || '').trim() &&
      String(watchedAddress || '').trim();

    const numericOk =
      Number.isFinite(Number(watchedQuantity)) &&
      Number.isFinite(Number(watchedPrice));

    const ok = Boolean(stringsOk && numericOk && priceValid && quantityValid && !submitting);
    setCanSubmit(ok);
  }, [
    watchedNames,
    watchedLastnames,
    watchedPhone,
    watchedCity,
    watchedEmail,
    watchedAddress,
    watchedQuantity,
    watchedPrice,
    priceValid,
    quantityValid,
    submitting,
  ]);

  function sanitizePhone(val) {
    if (!val) return '';
    return String(val).replace(/\D/g, '');
  }

  const requiredKeys = ['names', 'lastnames', 'phoneNumber', 'city', 'email', 'address'];

  // react-query mutations (from refactor)
  const createGuest = useCreateGuestCart();
  const addData = useAddDataToCart();
  const place = usePlaceOrder();
  const assignWarehouse = useAssignWarehouseOrder();

  const onSubmit = handleSubmit(async (formData) => {
    // basic required validation
    const missing = requiredKeys.filter((k) => !String(formData?.[k] ?? '').trim());
    if (missing.length) return;

    const qty = Number(formData.quantity || 0);
    if (!quantityValid || qty > availableStock) return;
    if (!priceValid) return;

    setSubmitting(true);
    try {
      // 1) create guest cart
      const cartId = await createGuest.mutateAsync();

      // 2) prepare fields
      const cityVal = String(formData.city || lastCityRef.current || '').trim();
      const cityOpt = (citiesOptions || []).find((c) => String(c.value) === cityVal);
      const cityName = cityOpt?.label || cityVal;
      const regionId = Number(cityOpt?.regionId || 0);

      const sku = product?.sku || '';
      const quantity = Number(formData.quantity || 1);
      const dropper_price = Number(formData.dropperPrice || 0);
      const firstname = formData.names?.trim() || 'Cliente';
      const lastname = formData.lastnames?.trim() || 'Invitado';

      const telephone = sanitizePhone(formData.phoneNumber);
      const street = [formData.address, formData.complemento].filter(Boolean);

      const email = formData.email;
      const carrier_code = 'envios';
      const method_code = 'inter';
      const payment_code = 'cashondelivery';

      // 3) add data to cart
      await addData.mutateAsync({
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

      // 4) place order
      const magentoOrderId = await place.mutateAsync({ cartId });

      // 5) try to assign warehouse (best-effort)
      try {
        await assignWarehouse.mutateAsync({ magento_order_id: magentoOrderId });
      } catch (assignErr) {
        const msg = assignErr?.message ?? String(assignErr);
        if (msg.toLowerCase().includes('token')) {
          console.warn('No hay token disponible para asignar la orden al warehouse. Saltando ASSIGN_WAREHOUSE_ORDER.');
        } else {
          throw assignErr;
        }
      }

      toast.success(`Orden creada correctamente: ${magentoOrderId}`);
      onClose?.();
    } catch (err) {
      console.error('Error en flujo de creación de orden:', err);
      const message =
        typeof err === 'string'
          ? err
          : err?.message ?? 'Ocurrió un error al crear la orden';
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
      fullScreen={isXs}
      maxWidth="lg"
      PaperProps={{
        sx: {
          m: { xs: 1.5, sm: 2, md: 0 },
          width: 'calc(100% - 24px)',
          maxWidth: isXs ? '100%' : undefined,
          height: isXs ? '100dvh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isXs ? 1.5 : 2,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.25, sm: 2 },
          typography: { xs: 'subtitle1', sm: 'h6' },
          position: 'sticky',
          top: 0,
          zIndex: 5,
          backgroundColor: 'background.paper',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        Crear orden manual
      </DialogTitle>

      <Form
        methods={methods}
        onSubmit={onSubmit}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <DialogContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, sm: 2.5, md: 2 },
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              pr: { xs: 0, sm: 0.5 },
              WebkitOverflowScrolling: 'touch',
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {/* Columna 1: Datos cliente */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ClientDataForm noBackground />
            </Box>

            {/* Columna 2: Cotizador - le pasamos product para que use sku */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <QuoterForm product={product} noBackground />
            </Box>

            {/* Columna 3: Producto + Resumen */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ProductOrderForm product={product} noBackground />
              <OrderSummary />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1, sm: 1.25 },
            gap: 1,
            flexWrap: 'wrap',
            position: 'sticky',
            bottom: 0,
            zIndex: 5,
            backgroundColor: 'background.paper',
            borderTop: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            size={isSm ? 'medium' : 'small'}
            disabled={submitting}
            fullWidth={isXs}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size={isSm ? 'medium' : 'small'}
            disabled={!canSubmit}
            fullWidth={isXs}
          >
            {submitting ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default CreateOrderModal;
