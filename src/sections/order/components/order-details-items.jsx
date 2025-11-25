import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function OrderDetailsItems({
  sx,
  taxes,
  shipping,
  discount,
  subtotal,
  items = [],
  totalAmount,
  ...other
}) {
  const renderTotal = () => (
    <Box
      sx={{
        p: 3,
        gap: 2,
        display: 'flex',
        textAlign: 'right',
        typography: 'body2',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subtotal) || '-'}</Box>
      </Box>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ color: 'text.secondary' }}>Envío</Box>
        <Box sx={{ width: 160, ...(shipping && { color: 'error.main' }) }}>
          {shipping ? `+ ${fCurrency(shipping)}` : '-'}
        </Box>
      </Box>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ color: 'text.secondary' }}>Impuestos</Box>
        <Box sx={{ width: 160, ...(taxes && { color: 'error.main' }) }}>
          {taxes ? `+ ${fCurrency(taxes)}` : '-'}
        </Box>
      </Box>

      <Box sx={{ display: 'flex' }}>
        <Box sx={{ color: 'text.secondary' }}>Descuento</Box>
        <Box sx={{ width: 160, ...(discount && { color: 'primary.main' }) }}>
          {discount ? `- ${fCurrency(discount)}` : '-'}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', typography: 'subtitle1' }}>
        <div>Total</div>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Box>
    </Box>
  );

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title="Detalles de los productos"
      />

      <Scrollbar>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={[
              (theme) => ({
                p: 3,
                minWidth: 500,
                display: 'flex',
                alignItems: 'center',
                borderBottom: `dashed 2px ${theme.vars.palette.background.neutral}`,
              }),
            ]}
          >
            <Link component={RouterLink} href={paths.home.product.details(item.sku)} underline='none'>
              <Avatar src={item.coverUrl} variant="rounded" sx={{ width: 48, height: 48, mr: 2 }} />
            </Link>

            <ListItemText
              primary={
                <Link component={RouterLink} href={paths.home.product.details(item.sku)} color="inherit" underline='none'>
                  {item.name}
                </Link>
              }
              secondary={item.sku}
              slotProps={{
                primary: { sx: { typography: 'body2' } },
                secondary: {
                  sx: { mt: 0.5, color: 'text.disabled' },
                },
              }}
            />

            <Box sx={{ typography: 'body2' }}>x{item.quantity}</Box>

            <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
              {fCurrency(item.price)}
            </Box>
          </Box>
        ))}
      </Scrollbar>

      {renderTotal()}
    </Card>
  );
}
