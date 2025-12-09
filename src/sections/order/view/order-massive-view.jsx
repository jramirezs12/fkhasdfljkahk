'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useGetCities } from 'src/actions/order/order';
import { fetchWishlists } from 'src/actions/wishlist/wishlist';
import { fetchShippingQuote } from 'src/actions/product/shipping-quote';
import {
  usePlaceOrder,
  useAddDataToCart,
  useCreateGuestCart,
  useAssignWarehouseOrder,
} from 'src/actions/order/cart';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { QuoterForm } from '../components/quoter-form';
import { ClientDataForm } from '../components/client-data-form';

export const CreateOrderSchema = z.object({
  names: z.string().min(1, 'El nombre es obligatorio'),
  lastnames: z.string().min(1, 'El apellido es obligatorio'),
  phoneNumber: z.string().min(7, 'El teléfono es obligatorio'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  email: z.string().email('Correo inválido'),
  address: z.string().min(1, 'La dirección es obligatoria'),
});

export default function OrderMassiveView({ product = null }) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  const providerPriceUnit = Number(product?.providerPrice ?? 0);
  const providerPrice = providerPriceUnit;
  const initialDropperPrice = Math.round(providerPrice * 1.8 * 100) / 100;

  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const [wishlistsLoading, setWishlistsLoading] = useState(false);
  const [, setWishlistsError] = useState(null);
  const [wishlistProducts, setWishlistProducts] = useState([]); // flattened list from all wishlists

  const [cartItems, setCartItems] = useState([]); // selected items for the order

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

  const { handleSubmit, watch, setValue, getValues } = methods;

  const { citiesOptions = [] } = useGetCities();

  const watchedCity = watch('city');
  const watchedNames = watch('names');
  const watchedLastnames = watch('lastnames');
  const watchedPhone = watch('phoneNumber');
  const watchedEmail = watch('email');
  const watchedAddress = watch('address');
  const watchedQuantity = Number(watch('quantity') || 0);

  const debounceRef = useRef(null);
  const lastCityRef = useRef('');

  useEffect(() => {
    const c = String(watchedCity || '').trim();
    if (c) lastCityRef.current = c;
  }, [watchedCity]);

  // load wishlists once and flatten products
  useEffect(() => {
    let mounted = true;
    (async () => {
      setWishlistsLoading(true);
      setWishlistsError(null);
      try {
        const lists = await fetchWishlists();
        if (!mounted) return;
        const flattened = [];
        (lists || []).forEach((wl) => {
          const wlName = wl?.name ?? 'Lista';
          const items = wl?.items_v2?.items || [];
          items.forEach((it) => {
            const prod = it?.product ?? {};
            flattened.push({
              id: it.id,
              sku: prod.sku,
              name: prod.name || it.description || prod.sku,
              image: prod?.image?.url || prod?.image?.[0]?.url || null,
              providerPrice: Number(prod?.price?.regularPrice?.amount?.value ?? 0),
              wishlistId: wl.id,
              wishlistName: wlName,
              defaultQuantity: Number(it.quantity || 1),
              qtyAvailable: Number(prod?.stock_saleable ?? prod?.stock_status ?? 0),
            });
          });
        });
        setWishlistProducts(flattened);
      } catch (err) {
        console.error('fetchWishlists error', err);
        setWishlistsError(err?.message ?? String(err));
      } finally {
        if (mounted) setWishlistsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // shipping quote logic (kept similar)
  useEffect(() => {
    let mounted = true;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const cityValue = String(watchedCity || lastCityRef.current || '').trim();
    if (!product?.id || !cityValue) {
      setShippingLoading(false);
      setShippingError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setShippingLoading(true);
        setShippingError(null);
        const found = (citiesOptions || []).find((c) => String(c.value) === String(cityValue));
        const destinationCityName = found ? String(found.label) : cityValue;
        const quote = await fetchShippingQuote(destinationCityName, Number(product.id), Number(watchedQuantity || 1));
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

  // helper: compute min allowed per item (180%)
  const minFor = useCallback((provider) => Math.round((Number(provider || 0) * 1.8) * 100) / 100, []);

  // validate a cart item according to the same rules as single-product form
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateCartItem = useCallback((item) => {
    const errors = { priceError: null, qtyError: null };
    const minAllowed = minFor(item.providerPrice);
    const price = Number(item.dropperPrice || 0);
    const qty = Number(item.quantity || 0);

    if (!Number.isFinite(price) || price <= 0) errors.priceError = 'Precio inválido';
    else if (price < minAllowed) errors.priceError = `El precio debe ser al menos ${minAllowed.toLocaleString('es-CO')}`;

    if (!Number.isFinite(qty) || qty < 1) errors.qtyError = 'La cantidad mínima es 1';
    else if (item.qtyAvailable && qty > Number(item.qtyAvailable)) errors.qtyError = `Solo hay ${item.qtyAvailable} disponibles`;

    return errors;
  });

  // recompute validity - used to disable submit
  useEffect(() => {
    const stringsOk =
      String(watchedNames || '').trim() &&
      String(watchedLastnames || '').trim() &&
      String(watchedPhone || '').trim() &&
      (String(watchedCity || '').trim() || lastCityRef.current) &&
      String(watchedEmail || '').trim() &&
      String(watchedAddress || '').trim();

    const hasCartItems = cartItems.length > 0;
    const noItemErrors = cartItems.every((it) => {
      const e = validateCartItem(it);
      return !e.priceError && !e.qtyError;
    });

    const ok = Boolean(stringsOk && hasCartItems && noItemErrors && !submitting);
    setCanSubmit(ok);
  }, [watchedNames, watchedLastnames, watchedPhone, watchedCity, watchedEmail, watchedAddress, submitting, cartItems, validateCartItem]);

  function sanitizePhone(val) {
    if (!val) return '';
    return String(val).replace(/\D/g, '');
  }

  const requiredKeys = ['names', 'lastnames', 'phoneNumber', 'city', 'email', 'address'];

  // react-query mutations
  const createGuest = useCreateGuestCart();
  const addData = useAddDataToCart();
  const place = usePlaceOrder();
  const assignWarehouse = useAssignWarehouseOrder();

  // compute totals
  const computeTotals = () => {
    const shippingBase = Number(getValues('shippingBase') || 0);
    const res = cartItems.reduce(
      (acc, it) => {
        const price = Number(it.dropperPrice || 0);
        const qty = Number(it.quantity || it.defaultQuantity || 1);
        acc.totalARecaudar += Math.round(price * qty);
        acc.providerTotal += Math.round((Number(it.providerPrice) || 0) * qty);
        return acc;
      },
      { totalARecaudar: 0, providerTotal: 0 }
    );
    const shippingPrice = shippingBase;
    const commission = Math.round((res.totalARecaudar + shippingPrice) * 0.02);
    const ganancias = Math.round(res.totalARecaudar - (res.providerTotal + shippingPrice + commission));
    return { ...res, shippingPrice, commission, ganancias };
  };

  const totals = computeTotals();

  const onSubmit = handleSubmit(async (formData) => {
    const missing = requiredKeys.filter((k) => !String(formData?.[k] ?? '').trim());
    if (missing.length) {
      toast.error('Faltan datos requeridos');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Agrega al menos un producto a la orden');
      return;
    }

    // final validation per item before sending
    for (const it of cartItems) {
      const errs = validateCartItem(it);
      if (errs.priceError || errs.qtyError) {
        toast.error(`Error en producto ${it.name}: ${errs.priceError || errs.qtyError}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const cartId = await createGuest.mutateAsync();

      for (const item of cartItems) {
        const qty = Number(item.quantity || item.defaultQuantity || 1);
        const dropper_price = Number(item.dropperPrice || 0);

        await addData.mutateAsync({
          cartId,
          quantity: qty,
          sku: item.sku,
          dropper_price,
          firstname: formData.names?.trim() || 'Cliente',
          lastname: formData.lastnames?.trim() || 'Invitado',
          street: [formData.address, formData.complemento].filter(Boolean),
          city: String(formData.city || lastCityRef.current || '').trim(),
          region_id: Number((citiesOptions || []).find((c) => String(c.value) === String(formData.city))?.regionId || 0),
          telephone: sanitizePhone(formData.phoneNumber),
          email: formData.email,
          carrier_code: 'envios',
          method_code: 'inter',
          payment_code: 'cashondelivery',
        });
      }

      const magentoOrderId = await place.mutateAsync({ cartId });

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
      setCartItems([]);
    } catch (err) {
      console.error('Error en flujo de creación de orden:', err);
      const message = typeof err === 'string' ? err : err?.message ?? 'Ocurrió un error al crear la orden';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  // add from select
  const handleAddFromSelect = (option) => {
    if (!option) return;
    setCartItems((s) => {
      if (s.some((x) => x.sku === option.sku && x.wishlistId === option.wishlistId)) return s;
      const currentDropper = Math.round((minFor(option.providerPrice)) * 100) / 100;
      return [
        ...s,
        {
          ...option,
          quantity: option.defaultQuantity || 1,
          dropperPrice: currentDropper,
        },
      ];
    });
  };

  const handleRemoveCartItem = (sku, wishlistId) => {
    setCartItems((s) => s.filter((x) => !(x.sku === sku && x.wishlistId === wishlistId)));
  };

  // inline edit handlers
  const handleChangeItemPrice = (sku, wishlistId, raw) => {
    const val = raw === '' ? '' : Number(raw);
    setCartItems((s) => s.map((it) => (it.sku === sku && it.wishlistId === wishlistId ? { ...it, dropperPrice: val } : it)));
  };

  const handleChangeItemQty = (sku, wishlistId, raw) => {
    const val = raw === '' ? '' : Math.max(0, Math.floor(Number(raw)));
    setCartItems((s) => s.map((it) => (it.sku === sku && it.wishlistId === wishlistId ? { ...it, quantity: val } : it)));
  };

  // format helper
  const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : v);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Creación de orden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Completa la información del cliente destino para realizar tu envío.
          </Typography>
        </Box>

        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => methods.handleSubmit(onSubmit)()}
            disabled={!canSubmit || submitting}
            size={isSm ? 'medium' : 'large'}
          >
            {submitting ? 'Enviando...' : 'Enviar orden'}
          </Button>
        </Box>
      </Box>

      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Información del cliente destino
                </Typography>
                <ClientDataForm noBackground />
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Productos en esta orden
                </Typography>

                {/* Select (Autocomplete) with thumbnail + wishlist name */}
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={wishlistProducts}
                    getOptionLabel={(op) => `${op.name} — ${op.wishlistName}`}
                    loading={wishlistsLoading}
                    onChange={(_, value) => {
                      handleAddFromSelect(value);
                    }}
                    isOptionEqualToValue={(o, v) => o.sku === v.sku && o.wishlistId === v.wishlistId}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={option.image || undefined} alt={option.name} sx={{ width: 32, height: 32 }} />
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="body2" noWrap>{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{option.wishlistName}</Typography>
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Buscar producto (wishlists)"
                        placeholder={wishlistsLoading ? 'Cargando...' : (wishlistProducts.length ? 'Escribe para buscar' : 'No hay productos en tus listas')}
                        size="small"
                      />
                    )}
                  />
                </Box>

                {/* Selected cart items with inline price & qty inputs */}
                {cartItems.length === 0 ? (
                  <Box sx={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Box sx={{ typography: 'h6', color: 'text.secondary', mb: 2 }}>Aún no tienes productos en esta orden</Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {cartItems.map((ci) => {
                      const errs = validateCartItem(ci);
                      const minAllowed = minFor(ci.providerPrice);
                      return (
                        <Paper key={`${ci.sku}-${ci.wishlistId}`} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Avatar src={ci.image || undefined} alt={ci.name} sx={{ width: 40, height: 40 }} />
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{ci.name}</Typography>
                              {/* Provider price first (on its own line), then wishlist name below */}
                              <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block', mt: 0.25 }}>
                                Proveedor: {fmt(Number(ci.providerPrice || 0))}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block', mt: 0.25 }}>
                                {ci.wishlistName}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              label="Precio"
                              size="small"
                              type="number"
                              value={ci.dropperPrice ?? ''}
                              onChange={(e) => handleChangeItemPrice(ci.sku, ci.wishlistId, e.target.value)}
                              error={!!errs.priceError}
                              helperText={errs.priceError ?? ''}
                              inputProps={{ step: '1000', min: minAllowed }}
                              sx={{ width: 140 }}
                            />

                            <TextField
                              label="Cantidad"
                              size="small"
                              type="number"
                              value={ci.quantity ?? ''}
                              onChange={(e) => handleChangeItemQty(ci.sku, ci.wishlistId, e.target.value)}
                              error={!!errs.qtyError}
                              helperText={errs.qtyError ?? ''}
                              inputProps={{ step: 1, min: 1, max: ci.qtyAvailable || undefined }}
                              sx={{ width: 100 }}
                            />

                            <IconButton size="small" onClick={() => handleRemoveCartItem(ci.sku, ci.wishlistId)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Stack>
          </Grid>

          {/* Right column: summary + quoter */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Información del pedido
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Total a recaudar</Typography>
                  <Typography variant="body2">${fmt(totals.totalARecaudar)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Precio proveedor</Typography>
                  <Typography variant="body2">${fmt(totals.providerTotal)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Precio de envío</Typography>
                  <Typography variant="body2">${fmt(totals.shippingPrice)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">Comisión de la plataforma (2%)</Typography>
                  <Typography variant="body2">${fmt(totals.commission)}</Typography>
                </Box>

                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">Ganancias</Typography>
                    <Typography variant="subtitle2" sx={{ color: totals.ganancias >= 0 ? 'success.main' : 'error.main', fontWeight: '700' }}>
                      ${fmt(totals.ganancias)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Cotización de envío
                </Typography>
                {shippingLoading ? (
                  <Typography variant="body2" color="text.secondary">Cotizando...</Typography>
                ) : shippingError ? (
                  <Typography variant="body2" color="error.main">{shippingError}</Typography>
                ) : (
                  <QuoterForm noBackground />
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </Box>
  );
}
