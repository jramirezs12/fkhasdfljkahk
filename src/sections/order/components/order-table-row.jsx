import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OrderTableRow({ row, detailsHref }) {
  const collapseRow = useBoolean();

  const renderPrimaryRow = () => (
    <TableRow hover>

      <TableCell>
        <Link component={RouterLink} href={detailsHref} color="inherit" underline="always">
          {row.orderNumber}
        </Link>
      </TableCell>

      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={row.customer.name}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: 20,
            }}
          >
            {row.customer.name
              ? row.customer.name
                .split(' ')
                .filter(Boolean)
                .map(word => word[0].toUpperCase())
                .join('')
              : '?'}
          </Avatar>
          <ListItemText
            primary={row.customer.name}
            secondary={row.customer.email}
            slotProps={{
              primary: {
                sx: { typography: 'body2' },
              },
              secondary: {
                sx: { color: 'text.disabled' },
              },
            }}
          />
        </Box>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(row.createdAt)}
          secondary={fTime(row.createdAt)}
          slotProps={{
            primary: {
              noWrap: true,
              sx: { typography: 'body2' },
            },
            secondary: {
              sx: { mt: 0.5, typography: 'caption' },
            },
          }}
        />
      </TableCell>

      <TableCell align="center"> {row.totalQuantity} </TableCell>

      <TableCell> {fCurrency(row.subtotal)} </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'Pago por confirmar' && 'warning') ||
            (row.status === 'Orden en Proceso' && 'warning') ||
            (row.status === 'Orden Confirmada' && 'success') ||
            (row.status === 'Entregado' && 'success') ||
            (row.status === 'Completo' && 'success') ||
            (row.status === 'Cancelado' && 'error') ||
            (row.status === 'Devuelto' && 'error') ||
            'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapseRow.value ? 'inherit' : 'default'}
          onClick={collapseRow.onToggle}
          sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondaryRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            {row.items.map((item) => (
              <Box
                key={item.id}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  p: theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                  },
                })}
              >
                <Link component={RouterLink} href={paths.home.product.details(item.sku)} underline='none'>
                  <Avatar
                    src={item.coverUrl}
                    variant="rounded"
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
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
                    secondary: { sx: { color: 'text.disabled' } },
                  }}
                />

                <div>x{item.quantity} </div>

                <Box sx={{ width: 110, textAlign: 'right' }}>{fCurrency(item.price)}</Box>
              </Box>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderSecondaryRow()}
    </>
  );
}
