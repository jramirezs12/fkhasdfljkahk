'use client';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

export function ProductIntegrationCard({
  integrator,
  onIntegrate,
  detailsHref,
  editHref,
  onDelete,
  sx,
  ...other
}) {
  const menuActions = usePopover();

  const {
    name = 'Integrador',
    logoUrl = '',
    lastUpdated,
    description = '',
  } = integrator || {};

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {!!detailsHref && (
          <li>
            <MenuItem
              component={RouterLink}
              href={detailsHref}
              onClick={() => menuActions.onClose()}
            >
              <Iconify icon="solar:eye-bold" />
              View
            </MenuItem>
          </li>
        )}

        {!!editHref && (
          <li>
            <MenuItem
              component={RouterLink}
              href={editHref}
              onClick={() => menuActions.onClose()}
            >
              <Iconify icon="solar:pen-bold" />
              Edit
            </MenuItem>
          </li>
        )}

        {!!onDelete && (
          <MenuItem
            onClick={() => {
              menuActions.onClose();
              onDelete?.();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card sx={{ position: 'relative', ...sx }} {...other}>
        <IconButton onClick={menuActions.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Box sx={{ p: 3, pb: 2 }}>
          <Avatar
            alt={name}
            src={logoUrl}
            variant="rounded"
            sx={{ width: 48, height: 48, mb: 2 }}
          />

          <ListItemText
            sx={{ mb: 0.75 }}
            primary={
              detailsHref ? (
                <Link component={RouterLink} href={detailsHref} color="inherit">
                  {name}
                </Link>
              ) : (
                name
              )
            }
            slotProps={{
              primary: { sx: { typography: 'subtitle1' } },
            }}
          />

          {!!description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {description}
            </Typography>
          )}

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Última actualización: {lastUpdated ? fDate(lastUpdated) : '—'}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onIntegrate}
            startIcon={<Iconify icon="solar:plug-circle-bold" />}
          >
            Integrar
          </Button>
        </Box>
      </Card>

      {renderMenuActions()}
    </>
  );
}
