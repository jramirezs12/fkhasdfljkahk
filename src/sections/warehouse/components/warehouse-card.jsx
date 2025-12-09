'use client';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { getInitialsFromFirstAndLastWord } from 'src/utils/format-text';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function WarehouseCard({ warehouse, onToggleActive }) {
  const menuActions = usePopover();

  const {
    name = 'Sucursal sin nombre',
    city = 'Ciudad no especificada',
    address = 'Dirección no registrada',
    contact_phone = '—',
  } = warehouse || {};

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {!!onToggleActive && (
          <MenuItem
            onClick={() => {
              menuActions.onClose();
              onToggleActive?.(warehouse);
            }}
            sx={{
              color: warehouse.status === 'active' ? 'grey.600' : 'primary.main',
            }}
          >
            <Iconify
              icon={
                warehouse.status === 'active'
                  ? 'solar:close-circle-bold'
                  : 'solar:check-circle-bold'
              }
            />
            {warehouse.status === 'active' ? 'Inhabilitar' : 'Habilitar'}
          </MenuItem>
        )}
        {warehouse.status === 'inactive' && (
          <MenuItem
            onClick={() => {
              menuActions.onClose();
              //onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Eliminar
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card sx={{ position: 'relative', p: 3 }} >
        <IconButton
          onClick={menuActions.onOpen}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        {/* Encabezado */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            alt={name}
            sx={{
              width: 48,
              height: 48,
              bgcolor: warehouse.status === 'active' ? 'primary.main' : 'grey.400',
              color: 'white',
              fontSize: 20,
            }}
          >
            {getInitialsFromFirstAndLastWord(name)}
          </Avatar>

          <Box sx={{ ml: 2, minWidth: 0 }}>
            <ListItemText
              primary={
                <Link
                  component={RouterLink}
                  href="#"
                  color="inherit"
                  underline="hover"
                  noWrap
                  sx={{ fontWeight: 'bold', typography: 'subtitle1' }}
                >
                  {name}
                </Link>
              }
              secondary={city}
              slotProps={{
                secondary: {
                  sx: { typography: 'body2', color: 'text.secondary' },
                },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

        <Box sx={{ display: 'grid', rowGap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify width={18} icon="solar:map-point-bold" />
            <Typography variant="body2" noWrap>
              {address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify width={18} icon="solar:phone-bold" />
            <Typography variant="body2">{contact_phone}</Typography>
          </Box>
        </Box>
      </Card>

      {renderMenuActions()}
    </>
  );
}
