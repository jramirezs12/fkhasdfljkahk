'use client';

import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import { linkClasses } from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { CreateOrderModal } from '../../order/view/create-order-modal';

// ----------------------------------------------------------------------

export function ProductDetailsSummary({ product, ...other }) {
  const {
    id = '',
    uid = '',
    sku = '',
    name = '',
    provider: providerProp = null,
    providerPrice = 0,
    suggestedPrice = 0,
    providerImage = null,
    available = 0,
    totalRatings = 0,
    totalReviews = 0,
    inventoryType = 'in stock',
  } = product || {};

  const providerName =
    (product?.provider && (typeof product.provider === 'object' ? product.provider.name : product.provider)) ||
    product?.providerName ||
    product?.vendor ||
    providerProp ||
    'Proveedor por defecto';

  const methods = useForm({ defaultValues: {} });
  const { handleSubmit } = methods;

  const [openOrderModal, setOpenOrderModal] = useState(false);

  const onSubmit = handleSubmit(async () => {});

  const onSendToClient = useCallback(() => {
    setOpenOrderModal(true);
    console.info('Abrir modal Generar venta -> SKU:', sku, 'ID:', id);
  }, [sku, id]);

  const onRequestSample = useCallback(() => {
    console.info('Solicitar muestra -> SKU:', sku, 'ID:', id);
  }, [sku, id]);

  const onViewReport = useCallback(() => {
    console.info('Ver informe -> SKU:', sku, 'ID:', id);
  }, [sku, id]);

  const getInitials = (text) => {
    if (!text) return '?';
    return text
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const renderHeader = () => (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        ID: {uid}
      </Typography>
      <Typography variant="h5">{name}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        SKU: {sku}
      </Typography>
    </Stack>
  );

  const renderPrices = () => (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">Precio del proveedor</Typography>
      <Typography variant="h6">{fCurrency(providerPrice)}</Typography>

      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        Precio sugerido
      </Typography>
      <Typography variant="h6" sx={{ color: 'primary.main' }}>
        {fCurrency(suggestedPrice)}
      </Typography>
    </Stack>
  );

  const renderRating = () => (
    <Box
      sx={{
        display: 'flex',
        typography: 'body2',
        alignItems: 'center',
        color: 'text.disabled',
      }}
    >
      <Rating size="small" value={totalRatings} precision={0.1} readOnly sx={{ mr: 1 }} />
      {`(${fShortenNumber(totalReviews)} reviews)`}
    </Box>
  );

  const renderInventoryType = () => (
    <Box
      component="span"
      sx={{
        typography: 'overline',
        color:
          (inventoryType === 'out of stock' && 'error.main') ||
          (inventoryType === 'low stock' && 'warning.main') ||
          'success.main',
      }}
    >
      {inventoryType} • Stock: {available}
    </Box>
  );

  const renderProviderCard = () => {
    const providerId =
      (product?.provider && typeof product.provider === 'object' && (product.provider.id ?? product.provider.uid)) ||
      product?.providerId ||
      product?.provider_id ||
      product?.providerUid ||
      product?.providerUid?.toString?.() ||
      product?.raw?.provider?.id ||
      null;

    const providerHref = providerId
      ? (paths.home.provider && typeof paths.home.provider.details === 'function'
          ? paths.home.provider.details(String(providerId))
          : `/home/provider/${String(providerId)}`)
      : (paths.home.store?.root ?? paths.home.root);

    return (
      <Card
        component={RouterLink}
        href={providerHref}
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          width: '100%',
          bgcolor: 'background.paper',
          boxShadow: 'none',
          borderColor: (theme) => theme.vars?.palette?.divider ?? 'rgba(0,0,0,0.12)',
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <Avatar
          src={providerImage || ''}
          alt={providerName}
          sx={{ width: 56, height: 56, bgcolor: providerImage ? 'transparent' : 'primary.main' }}
        >
          {!providerImage && getInitials(providerName)}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{providerName}</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Label color="default" variant="soft">
              Proveedor
            </Label>
          </Box>
        </Box>
      </Card>
    );
  };

  const renderActions = () => {
    const commonBtnSx = {
      px: 2,
      py: 0.75,
      minHeight: 36,
      borderRadius: 1.25,
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: 'none',
      '& .MuiButton-startIcon': { mr: 1 },
      flex: { xs: '1 1 100%', sm: '0 1 auto' },
      minWidth: { xs: '100%', sm: 160 },
      whiteSpace: 'nowrap',
    };

    return (
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: { xs: 'stretch', sm: 'flex-start' },
          width: '100%',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={onSendToClient}
          startIcon={<Iconify icon="solar:cart-check-bold" width={18} />}
          sx={{
            ...commonBtnSx,
            flexBasis: { xs: '100%', sm: 'auto' },
          }}
        >
          Generar venta
        </Button>

        <Button
          variant="contained"
          size="medium"
          onClick={onRequestSample}
          startIcon={<Iconify icon="solar:gift-bold" width={18} />}
          sx={(theme) => ({
            ...commonBtnSx,
            backgroundColor: alpha(theme.palette.primary.main, 0.14),
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.20),
            },
            boxShadow: 'none',
          })}
        >
          Quiero probarlo
        </Button>

        <Button
          variant="contained"
          size="medium"
          onClick={onViewReport}
          startIcon={<Iconify icon="solar:chart-bold" width={18} />}
          sx={(theme) => ({
            ...commonBtnSx,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            boxShadow: 'none',
          })}
        >
          Analizar desempeño
        </Button>
      </Box>
    );
  };

  const renderShare = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        justifyContent: 'center',
        [`& .${linkClasses.root}`]: {
          gap: 1,
          alignItems: 'center',
          display: 'inline-flex',
          color: 'text.secondary',
          typography: 'subtitle2',
        },
      }}
    />
  );

  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3} sx={{ pt: 3 }} {...other}>
          <Stack spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
            {renderHeader()}

            {renderProviderCard()}

            {renderInventoryType()}
            {renderRating()}
            {renderPrices()}
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {renderActions()}
          {renderShare()}
        </Stack>
      </Form>

      <CreateOrderModal
        product={product}
        open={openOrderModal}
        onClose={() => setOpenOrderModal(false)}
      />
    </>
  );
}

export default ProductDetailsSummary;
