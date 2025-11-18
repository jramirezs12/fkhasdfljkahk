'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function ProductFilters({ open, canReset, onOpen, onClose, filters, options }) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleToggleArray = useCallback(
    (key, value) => {
      const list = currentFilters[key] || [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      updateFilters({ [key]: next });
    },
    [currentFilters, updateFilters]
  );

  const renderHead = () => (
    <>
      <Box sx={{ py: 2, pr: 1, pl: 2.5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Filters</Typography>
        <Tooltip title="Reset">
          <IconButton onClick={() => resetFilters()}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        </Tooltip>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>
      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  const renderCategories = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Categories
      </Typography>
      {(options?.categories || []).map((opt) => (
        <FormControlLabel
          key={opt.value}
          control={
            <Checkbox
              checked={currentFilters.categories.includes(opt.value)}
              onClick={() => handleToggleArray('categories', opt.value)}
              slotProps={{ input: { id: `${opt.value}-checkbox` } }}
            />
          }
          label={opt.label}
        />
      ))}
    </Box>
  );

  const renderStock = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Stock
      </Typography>
      {(options?.stocks || []).map((opt) => (
        <FormControlLabel
          key={opt.value}
          control={
            <Checkbox
              checked={currentFilters.stock.includes(opt.value)}
              onClick={() => handleToggleArray('stock', opt.value)}
              slotProps={{ input: { id: `${opt.value}-checkbox` } }}
            />
          }
          label={opt.label}
        />
      ))}
    </Box>
  );

  const renderPublish = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Publish
      </Typography>
      {(options?.publishs || []).map((opt) => (
        <FormControlLabel
          key={opt.value}
          control={
            <Checkbox
              checked={currentFilters.publish.includes(opt.value)}
              onClick={() => handleToggleArray('publish', opt.value)}
              slotProps={{ input: { id: `${opt.value}-checkbox` } }}
            />
          }
          label={opt.label}
        />
      ))}
    </Box>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ backdrop: { invisible: true }, paper: { sx: { width: 320 } } }}
      >
        {renderHead()}

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderCategories()}
            {renderStock()}
            {renderPublish()}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
