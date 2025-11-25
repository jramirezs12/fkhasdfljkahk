'use client';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export function TablePaginationCustom({
  sx,
  dense,
  onChangeDense,
  showDense = true,
  rowsPerPageOptions = [5, 10, 25],
  ...other
}) {
  return (
    <Box sx={[{ position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{ borderTopColor: 'transparent' }}
      />

      {showDense ? (
        onChangeDense && (
          <FormControlLabel
            label="Vista compacta"
            control={
              <Switch
                checked={dense}
                onChange={onChangeDense}
                slotProps={{ input: { id: 'dense-switch' } }}
              />
            }
            sx={{
              pl: 2,
              py: 1.5,
              top: 0,
              position: { sm: 'absolute' },
            }}
          />
        )
      )
        : null
      }
    </Box>
  );
}
