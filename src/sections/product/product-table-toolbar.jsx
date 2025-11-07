'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar'; 
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import { Iconify } from 'src/components/iconify';
import {
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
  CustomToolbarSettingsButton,
} from 'src/components/custom-data-grid';

import { ProductTableFiltersResult } from './product-table-filters-result';

// ----------------------------------------------------------------------

function FilterSelect({ label, value, options = [], onChange, onApply }) {
  const id = `filter-${label.toLowerCase()}-select`;

  return (
    <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={value}
        onChange={onChange}
        onClose={onApply}
        renderValue={(selected) => {
          const output = options
            .filter((opt) => selected.includes(opt.value))
            .map((opt) => opt.label);
          return output.join(', ');
        }}
        inputProps={{ id }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox
              disableRipple
              size="small"
              checked={value.includes(option.value)}
              slotProps={{ input: { id: `${option.value}-checkbox` } }}
            />
            {option.label}
          </MenuItem>
        ))}

        <MenuItem
          onClick={onApply}
          sx={(theme) => ({
            justifyContent: 'center',
            fontWeight: theme.typography.button,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          })}
        >
          Apply
        </MenuItem>
      </Select>
    </FormControl>
  );
}

// ----------------------------------------------------------------------

export function ProductTableToolbar({
  options,
  filters,
  canReset,
  filteredResults,
  selectedRowCount,
  onOpenConfirmDeleteRows,
  // Settings opcionales
  settings,
  onChangeSettings,
  // Extras para operar fuera del DataGrid (opcionales con fallbacks)
  quickFilterValue = '',
  onQuickFilterChange = () => {},
  columns = [], // [{ key, label, visible }]
  onToggleColumn = () => {},
  onExport = () => {},
}) {
  const safeOptions = useMemo(
    () => ({
      stocks: Array.isArray(options?.stocks) ? options.stocks : [],
      publishs: Array.isArray(options?.publishs) ? options.publishs : [],
    }),
    [options]
  );

  const { state: currentFilters, setState: updateFilters } = filters;

  const [stock, setStock] = useState(currentFilters.stock || []);
  const [publish, setPublish] = useState(currentFilters.publish || []);

  // Popover columnas
  const [anchorCols, setAnchorCols] = useState(null);
  const openCols = Boolean(anchorCols);
  const handleOpenColumns = (e) => setAnchorCols(e.currentTarget);
  const handleCloseColumns = () => setAnchorCols(null);

  // Menú export
  const [anchorExport, setAnchorExport] = useState(null);
  const openExport = Boolean(anchorExport);
  const handleOpenExport = (e) => setAnchorExport(e.currentTarget);
  const handleCloseExport = () => setAnchorExport(null);

  // Menú filtros avanzados (placeholder)
  const [anchorFilter, setAnchorFilter] = useState(null);
  const openFilter = Boolean(anchorFilter);
  const handleOpenFilter = (e) => setAnchorFilter(e.currentTarget);
  const handleCloseFilter = () => setAnchorFilter(null);

  const handleSelect = useCallback(
    (setter) => (event) => {
      const value = event.target.value;
      const parsedValue = typeof value === 'string' ? value.split(',') : value;
      setter(parsedValue);
    },
    []
  );

  const renderLeftPanel = () => (
    <>
      <FilterSelect
        label="Stock"
        value={stock}
        options={safeOptions.stocks}
        onChange={handleSelect(setStock)}
        onApply={() => updateFilters({ stock })}
      />

      <FilterSelect
        label="Publish"
        value={publish}
        options={safeOptions.publishs}
        onChange={handleSelect(setPublish)}
        onApply={() => updateFilters({ publish })}
      />

      {/* QuickFilter con el mismo icono */}
      <TextField
        label="Search"
        value={quickFilterValue}
        onChange={(e) => onQuickFilterChange(e.target.value)}
        size="small"
        sx={{ width: { xs: 1, md: 220 } }}
        InputProps={{
          startAdornment: (
            <Box component="span" sx={{ display: 'flex', mr: 1 }}>
              <Iconify icon="solar:magnifier-bold" width={18} />
            </Box>
          ),
        }}
      />
    </>
  );

  const renderRightPanel = () => (
    <>
      {!!selectedRowCount && (
        <Button
          size="small"
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          onClick={onOpenConfirmDeleteRows}
        >
          Delete ({selectedRowCount})
        </Button>
      )}

      {/* Columns (mismo icono que antes) */}
      <IconButton size="small" onClick={handleOpenColumns} aria-label="Columns">
        <Iconify icon="solar:slider-vertical-bold" />
      </IconButton>

      {/* Filter (mismo icono; menú placeholder) */}
      <IconButton size="small" onClick={handleOpenFilter} aria-label="Filter">
        <Iconify icon="solar:filter-bold" />
      </IconButton>

      {/* Export (mismo icono) */}
      <IconButton size="small" onClick={handleOpenExport} aria-label="Export">
        <Iconify icon="solar:download-minimalistic-bold" />
      </IconButton>

      {/* Settings (idéntico a antes) */}
      <CustomToolbarSettingsButton settings={settings} onChangeSettings={onChangeSettings} />
    </>
  );

  return (
    <>
      <Toolbar>
        <ToolbarContainer>
          <ToolbarLeftPanel>{renderLeftPanel()}</ToolbarLeftPanel>
          <ToolbarRightPanel>{renderRightPanel()}</ToolbarRightPanel>
        </ToolbarContainer>
      </Toolbar>

      {canReset && (
        <ProductTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      {/* Popover de columnas: toggle de visibilidad (equivalente a ColumnsButton) */}
      <Popover
        open={openCols}
        anchorEl={anchorCols}
        onClose={handleCloseColumns}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 1, minWidth: 220 } } }}
      >
        <Box sx={{ typography: 'subtitle2', px: 1, pb: 1 }}>Columns</Box>
        <Divider sx={{ mb: 1 }} />
        {columns.map((col) => (
          <MenuItem key={col.key} onClick={() => onToggleColumn(col.key)} dense sx={{ py: 0.75 }}>
            <Checkbox size="small" disableRipple checked={!!col.visible} sx={{ mr: 1 }} />
            <ListItemText primary={col.label} primaryTypographyProps={{ variant: 'caption' }} />
          </MenuItem>
        ))}
      </Popover>

      {/* Menú Export (equivalente a ExportButton) */}
      <Menu
        open={openExport}
        anchorEl={anchorExport}
        onClose={handleCloseExport}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onExport('csv');
            handleCloseExport();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:database-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Export CSV" />
        </MenuItem>
      </Menu>

      {/* Menú Filters extra (placeholder para filtros avanzados) */}
      <Menu
        open={openFilter}
        anchorEl={anchorFilter}
        onClose={handleCloseFilter}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <ListItemText primary="Advanced filters (coming soon)" />
        </MenuItem>
      </Menu>
    </>
  );
}
