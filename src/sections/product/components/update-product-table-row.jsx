import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';

import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// Helper: normalize errors into array of strings
function normalizeErrors(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === 'string') {
    const parts = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts : [raw];
  }
  try {
    return [JSON.stringify(raw)];
  } catch {
    return [String(raw)];
  }
}

// Normalize status into one of the canonical values:
// 'failed' | 'processed_with_errors' | 'completed' | 'pending'
function normalizeStatus(job) {
  const raw = (job?.status || '').toString().toLowerCase();
  const errors = normalizeErrors(job?.errors || []);

  if (raw.includes('failed')) return 'failed';
  if (errors.length > 0) return 'processed_with_errors';
  if (raw.includes('completed')) return 'completed';
  if (raw.includes('processing') || raw.includes('started') || raw.includes('in_progress')) return 'pending';
  return 'pending';
}

function prettyStatusLabel(status) {
  if (!status) return '-';
  if (status === 'processed_with_errors') return 'Procesado con errores';
  if (status === 'failed') return 'Fallido';
  if (status === 'completed') return 'Completado';
  if (status === 'pending') return 'Pendiente';
  return String(status).replace(/_/g, ' ');
}

export function UpdateProductTableRow({ job, selected, onSelectRow }) {
  const [openErrors, setOpenErrors] = useState(false);

  const errors = useMemo(() => normalizeErrors(job?.errors), [job?.errors]);
  const status = useMemo(() => normalizeStatus(job), [job]);

  const statusToColor = (s) => {
    if (!s) return 'default';
    if (s === 'completed') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'failed') return 'error';
    if (s === 'processed_with_errors') return 'error';
    return 'default';
  };

  return (
    <>
      <TableRow hover selected={!!selected}>
        {/* Selection checkbox cell (important: must be first to align with header) */}
        <TableCell padding="checkbox">
          <Checkbox
            checked={!!selected}
            onClick={onSelectRow}
            slotProps={{
              input: {
                id: `${job?.id ?? job?.job_id}-checkbox`,
                'aria-label': `${job?.job_id} checkbox`,
              },
            }}
          />
        </TableCell>

        {/* Job ID */}
        <TableCell>{job?.job_id}</TableCell>

        {/* Created */}
        <TableCell>
          <div style={{ whiteSpace: 'nowrap' }}>{job?.created_at ? fDate(job.created_at) : '-'}</div>
          <div style={{ color: 'var(--mui-palette-text-disabled)', fontSize: 12 }}>
            {job?.created_at ? fTime(job.created_at) : ''}
          </div>
        </TableCell>

        {/* Started */}
        <TableCell>
          <div style={{ whiteSpace: 'nowrap' }}>{job?.started_at ? fDate(job.started_at) : '-'}</div>
          <div style={{ color: 'var(--mui-palette-text-disabled)', fontSize: 12 }}>
            {job?.started_at ? fTime(job.started_at) : ''}
          </div>
        </TableCell>

        {/* Finished */}
        <TableCell>
          <div style={{ whiteSpace: 'nowrap' }}>{job?.finished_at ? fDate(job.finished_at) : '-'}</div>
          <div style={{ color: 'var(--mui-palette-text-disabled)', fontSize: 12 }}>
            {job?.finished_at ? fTime(job.finished_at) : ''}
          </div>
        </TableCell>

        {/* Status column: only the normalized status */}
        <TableCell>
          <Label variant="soft" color={statusToColor(status)}>
            {prettyStatusLabel(status)}
          </Label>
        </TableCell>

        {/* Errors column: chip with count, tooltip shows full list, dialog with full list */}
        <TableCell sx={{ minWidth: 160, px: 2 }}>
          {errors.length > 0 ? (
            <Stack direction="row" spacing={1} alignItems="center" >
              <Tooltip
                placement="top"
                title={
                  <Box sx={{ maxWidth: 360 }}>
                    {errors.map((e, i) => (
                      <Typography key={i} variant="body2" sx={{ whiteSpace: 'normal', mb: i < errors.length - 1 ? 0.5 : 0 }}>
                        {e}
                      </Typography>
                    ))}
                  </Box>
                }
              >
                <Chip
                  label={`${errors.length} error${errors.length > 1 ? 'es' : ''}`}
                  size="small"
                  color="error"
                />
              </Tooltip>

              <Tooltip title="Ver errores">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setOpenErrors(true)}
                  aria-label={`Ver ${errors.length} errores del job ${job?.job_id}`}
                >
                  <Iconify icon="solar:warning-bold" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Tooltip title="Sin errores">
              <Chip label="OK" size="small" color="success" />
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      <Dialog open={openErrors} onClose={() => setOpenErrors(false)} maxWidth="md" fullWidth>
        <DialogTitle>Errores — {job?.job_id}</DialogTitle>

        <DialogContent dividers>
          {errors.length === 0 ? (
            <Typography color="text.secondary">No se encontraron errores.</Typography>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Se encontraron {errors.length} error{errors.length > 1 ? 'es' : ''}.
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <List>
                {errors.map((err, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText primary={err} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateProductTableRow;
