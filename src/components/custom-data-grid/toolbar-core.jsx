'use client';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterClear,
  FilterPanelTrigger,
  QuickFilterControl,
  ColumnsPanelTrigger,
} from '@mui/x-data-grid';

import { ExportIcon, FilterIcon, ViewColumnsIcon } from 'src/theme/core/components/mui-x-data-grid';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function ToolbarButtonBase({ sx, label, icon, showLabel = true, ...other }) {
  const Component = showLabel ? Button : IconButton;

  const baseProps = showLabel ? { size: 'small' } : {};

  return (
    <Tooltip title={label}>
      <Component
        {...baseProps}
        {...other}
        sx={[
          {
            gap: showLabel ? 0.75 : 0,
            '& svg': {
              width: showLabel ? 18 : 20,
              height: showLabel ? 18 : 20,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {icon}
        {showLabel && label}
      </Component>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

export function CustomToolbarColumnsButton({ showLabel }) {
  return (
    <ColumnsPanelTrigger
      render={(props) => (
        <ToolbarButtonBase
          {...props}
          label="Columnas"
          icon={<ViewColumnsIcon />}
          showLabel={showLabel}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function CustomToolbarFilterButton({ showLabel }) {
  return (
    <FilterPanelTrigger
      render={(props, state) => (
        <ToolbarButtonBase
          {...props}
          label="Filtros"
          showLabel={showLabel}
          icon={
            <Badge variant="dot" color="error" badgeContent={state.filterCount}>
              <FilterIcon />
            </Badge>
          }
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function CustomToolbarExportButton({ showLabel }) {
  const { open, anchorEl, onClose, onOpen } = usePopover();

  return (
    <>
      <ToolbarButtonBase
        id="export-menu-trigger"
        aria-controls="export-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={onOpen}
        label="Exportar"
        icon={<ExportIcon />}
        showLabel={showLabel}
      />

      <Menu
        id="export-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': 'export-menu-trigger',
          },
        }}
      >
        <ExportPrint render={<MenuItem />} onClick={onClose}>
          Imprimir
        </ExportPrint>

        <ExportCsv render={<MenuItem />} onClick={onClose}>
          Descargar como CSV
        </ExportCsv>
      </Menu>
    </>
  );
}

// ----------------------------------------------------------------------

export function CustomToolbarQuickFilter({ sx, slotProps, ...other }) {
  return (
    <QuickFilter
      {...other}
      render={(props) => (
        <Box
          {...props}
          sx={[{ width: 1, maxWidth: { md: 260 } }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          <QuickFilterControl
            render={({ ref, ...controlProps }, state) => (
              <TextField
                {...controlProps}
                fullWidth
                inputRef={ref}
                aria-label="Buscar"
                placeholder="Buscar..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" />
                      </InputAdornment>
                    ),
                    endAdornment: state.value ? (
                      <InputAdornment position="end">
                        <QuickFilterClear edge="end" size="small" aria-label="Clear search">
                          <Iconify icon="mingcute:close-line" width={16} />
                        </QuickFilterClear>
                      </InputAdornment>
                    ) : null,
                    ...controlProps.slotProps?.input,
                  },
                  ...controlProps.slotProps,
                  ...slotProps?.textField?.slotProps,
                }}
                {...slotProps?.textField}
              />
            )}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export const ToolbarContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    alignItems: 'center',
    flexDirection: 'row',
  },
}));

export const ToolbarLeftPanel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

export const ToolbarRightPanel = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));
