'use client';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

/**
 * UserCard adaptado para parecerse al JobItem:
 * - Botón de acciones (ver/editar/eliminar) con popover
 * - Encabezado con avatar, nombre (link), subtítulo
 * - Sección inferior en grilla con 2 columnas (role, posts, followers, following)
 *
 * Props:
 * - user: {
 *     id?, name, role?, avatarUrl?, email?,
 *     totalFollowers?, totalFollowing?, totalPosts?,
 *   }
 * - editHref?: string
 * - detailsHref?: string
 * - onDelete?: () => void
 */
export function UserCard({ user, editHref, detailsHref, onDelete, sx, ...other }) {
  const menuActions = usePopover();

  const {
    name = 'Usuario',
    role = '',
    avatarUrl = '',
    email = '',
    totalFollowers = 0,
    totalFollowing = 0,
    totalPosts = 0,
  } = user || {};

  const subtitle = role || email || '';

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
            <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
              <Iconify icon="solar:eye-bold" />
              View
            </MenuItem>
          </li>
        )}

        {!!editHref && (
          <li>
            <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
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
      <Card sx={sx} {...other}>
        <IconButton onClick={menuActions.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        {/* Encabezado (similar a JobItem) */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Avatar alt={name} src={avatarUrl} variant="rounded" sx={{ width: 48, height: 48, mb: 2 }} />

          <ListItemText
            sx={{ mb: 1 }}
            primary={
              detailsHref ? (
                <Link component={RouterLink} href={detailsHref} color="inherit">
                  {name}
                </Link>
              ) : (
                name
              )
            }
            secondary={subtitle}
            slotProps={{
              primary: { sx: { typography: 'subtitle1' } },
              secondary: { sx: { mt: 1, typography: 'caption', color: 'text.disabled' } },
            }}
          />

          {/* Línea de apoyo (como “candidates” en JobItem). Aquí mostramos followers. */}
          <Box
            sx={{
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main',
              typography: 'caption',
            }}
          >
            <Iconify width={16} icon="solar:users-group-rounded-bold" />
            {fShortenNumber(totalFollowers)} followers
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Sección inferior en grilla (2 columnas) */}
        <Box
          sx={{
            p: 3,
            rowGap: 1.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {[
            {
              label: role || '—',
              icon: <Iconify width={16} icon="solar:user-rounded-bold" sx={{ flexShrink: 0 }} />,
            },
            {
              label: `${fShortenNumber(totalPosts)} posts`,
              icon: <Iconify width={16} icon="solar:document-bold" sx={{ flexShrink: 0 }} />,
            },
            {
              label: `${fShortenNumber(totalFollowers)} followers`,
              icon: <Iconify width={16} icon="solar:users-group-rounded-bold" sx={{ flexShrink: 0 }} />,
            },
            {
              label: `${fShortenNumber(totalFollowing)} following`,
              icon: <Iconify width={16} icon="solar:user-plus-bold" sx={{ flexShrink: 0 }} />,
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                gap: 0.5,
                minWidth: 0,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              {item.icon}
              <Typography variant="caption" noWrap>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {renderMenuActions()}
    </>
  );
}
