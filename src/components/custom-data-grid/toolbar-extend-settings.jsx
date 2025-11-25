'use client';

import { usePopover } from 'minimal-shared/hooks';
import { useState, useCallback, useMemo } from 'react';

import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { svgIconClasses } from '@mui/material/SvgIcon';

import {
  EyeIcon,
  EyeCloseIcon,
  DensityCompactIcon,
  DensityStandardIcon,
  DensityComfortableIcon,
} from 'src/theme/core/components/mui-x-data-grid';

import { Iconify } from '../iconify';
import { ToolbarButtonBase } from './toolbar-core';

// ----------------------------------------------------------------------
// Valores por defecto compartidos
export const DEFAULT_TOOLBAR_SETTINGS = {
  density: 'standard',
  showCellVerticalBorder: false,
  showColumnVerticalBorder: false,
};

// ----------------------------------------------------------------------

/**
 * Docs
 * https://mui.com/x/react-data-grid/components/toolbar/
 */

export function useToolbarSettings(initialSettings) {
  // Memo para evitar recrear un objeto nuevo en cada render
  const defaultSettings = useMemo(
    () => ({
      ...DEFAULT_TOOLBAR_SETTINGS,
      ...(initialSettings || {}),
    }),
    [initialSettings]
  );

  const [settings, setSettings] = useState(defaultSettings);

  return {
    settings,
    onChangeSettings: setSettings,
  };
}

// ----------------------------------------------------------------------

const GRID_DENSITY_OPTIONS = [
  { label: 'Densidad compacta', value: 'compact', icon: <DensityCompactIcon /> },
  { label: 'Densidad estándar', value: 'standard', icon: <DensityStandardIcon /> },
  { label: 'Densidad cómoda', value: 'comfortable', icon: <DensityComfortableIcon /> },
];

export function CustomToolbarSettingsButton({
  settings,
  onChangeSettings,
  showLabel,
  label = 'Configuración',
}) {
  // Fallbacks robustos: previenen crashes si no pasan props
  const safeSettings = settings ?? DEFAULT_TOOLBAR_SETTINGS;
  const safeOnChangeSettings = onChangeSettings ?? (() => {});

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const handleChangeDensity = useCallback(
    (value) => {
      safeOnChangeSettings((prev) => ({
        ...(typeof prev === 'object' && prev ? prev : safeSettings),
        density: value,
      }));
    },
    [safeOnChangeSettings, safeSettings]
  );

  const handleToggleSetting = useCallback(
    (key) => {
      safeOnChangeSettings((prev) => {
        const base = (typeof prev === 'object' && prev ? prev : safeSettings);
        return { ...base, [key]: !base[key] };
      });
    },
    [safeOnChangeSettings, safeSettings]
  );

  const renderToggleOption = (menuItemLabel, key) => {
    const selected = !!safeSettings[key];

    return (
      <MenuItem key={key} selected={selected} onClick={() => handleToggleSetting(key)}>
        {selected ? <EyeIcon /> : <EyeCloseIcon />}
        {menuItemLabel}
      </MenuItem>
    );
  };

  return (
    <>
      <Tooltip title={label}>
        <ToolbarButtonBase
          id="settings-menu-trigger"
          aria-controls="settings-menu"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={onOpen}
          label={label}
          icon={<Iconify icon="solar:settings-bold" />}
          showLabel={showLabel}
        />
      </Tooltip>

      <Menu
        id="settings-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': 'settings-menu-trigger',
            sx: {
              [`& .${svgIconClasses.root}`]: {
                mr: 2,
                fontSize: 20,
              },
            },
          },
        }}
      >
        {GRID_DENSITY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={safeSettings.density === option.value}
            onClick={() => handleChangeDensity(option.value)}
          >
            {option.icon}
            {option.label}
          </MenuItem>
        ))}

        <Divider />

        {renderToggleOption('Mostrar bordes de columna', 'showColumnVerticalBorder')}
        {renderToggleOption('Mostrar bordes de celda', 'showCellVerticalBorder')}
      </Menu>
    </>
  );
}
