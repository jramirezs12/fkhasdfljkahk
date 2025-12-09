'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { HomeContent } from 'src/layouts/home';
import { getUserJobs } from 'src/actions/upload/getUserJobs';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import JobTableRow from '../components/update-product-table-row';
import { UpdateProductAnalytic } from '../components/update-product-analytic';
import ProductUploadBulkDialog from '../components/product-upload-bulk-dialog';



// reuse normalizeStatus to keep consistent logic (duplicate safe)
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

function normalizeStatusFromJob(job) {
  const raw = (job?.status || '').toString().toLowerCase();
  const errors = normalizeErrors(job?.errors || []);
  if (raw.includes('failed')) return 'failed';
  if (errors.length > 0) return 'processed_with_errors';
  if (raw.includes('completed')) return 'completed';
  if (raw.includes('processing') || raw.includes('started') || raw.includes('in_progress')) return 'pending';
  return 'pending';
}

const TABLE_HEAD = [
  { id: 'job_id', label: 'Id de la carga' },
  { id: 'created_at', label: 'Creado' },
  { id: 'started_at', label: 'Iniciado' },
  { id: 'finished_at', label: 'Finalizado' },
  { id: 'status', label: 'Estado' },
  { id: 'errors', label: 'Errores' },
];

export function UploadProductListView() {
  const theme = useTheme();

  const table = useTable({ defaultOrderBy: 'created_at' });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openBulk, setOpenBulk] = useState(false); // <-- modal state here

  const filters = useSetState({
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await getUserJobs();
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message || 'No se pudieron obtener los jobs');
      return;
    }
    // ensure array
    const data = Array.isArray(res.data) ? res.data : [];
    // normalize items: give each an id for selection/pagination
    const normalized = data.map((j, idx) => ({ ...j, id: j.job_id ?? `job-${idx}`, _normalizedStatus: normalizeStatusFromJob(j) }));
    setJobs(normalized);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const dataFiltered = useMemo(() => {
    let inputData = [...jobs];
    // simple status filter
    if (currentFilters.status && currentFilters.status !== 'all') {
      inputData = inputData.filter((j) => String(j._normalizedStatus).toLowerCase() === String(currentFilters.status).toLowerCase());
    }
    // date range filter (created_at)
    if (currentFilters.startDate && currentFilters.endDate) {
      const start = new Date(currentFilters.startDate).getTime();
      const end = new Date(currentFilters.endDate).getTime();
      inputData = inputData.filter((j) => {
        const t = j.created_at ? new Date(j.created_at).getTime() : 0;
        return t >= start && t <= end;
      });
    }
    // sorting
    inputData.sort((a, b) => {
      const order = getComparator(table.order, table.orderBy)(a, b);
      return order;
    });
    return inputData;
  }, [jobs, currentFilters, table.order, table.orderBy]);

  const canReset =
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getCountByStatus = (s) => jobs.filter((j) => String(j._normalizedStatus || '').toLowerCase() === String(s).toLowerCase()).length;

  const TABS = [
    { value: 'all', label: 'Todas', color: 'default', count: jobs.length },
    { value: 'completed', label: 'Completado', color: 'success', count: getCountByStatus('completed') },
    { value: 'failed', label: 'Fallido', color: 'error', count: getCountByStatus('failed') },
    { value: 'processing', label: 'Pendiente', color: 'warning', count: getCountByStatus('pending') },
    { value: 'processed_with_errors', label: 'Procesado con errores', color: 'error', count: getCountByStatus('processed_with_errors') },
  ];

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const handleRefresh = async () => {
    await fetchJobs();
    toast.success('Cargas actualizadas');
  };

  return (
    <>
      <HomeContent>
        <CustomBreadcrumbs
          heading="Carga masiva"
          links={[
            { name: 'Inicio', href: '/' },
            { name: 'Mis productos', href: '/product/' },
            { name: 'Carga masiva', href: '/product/upload' },
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Button to open bulk upload modal */}
              <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={() => setOpenBulk(true)}>
                Carga de archivos
              </Button>

              {/* Existing refresh button */}
              <Button variant="contained" startIcon={<Iconify icon="eva:refresh-fill" />} onClick={handleRefresh}>
                Refrescar
              </Button>
            </Box>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar sx={{ minHeight: 108 }}>
            <Stack
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2, flexDirection: 'row' }}
            >
              <UpdateProductAnalytic
                title="Cargas totales"
                total={jobs.length}
                percent={100}
                icon="solar:bill-list-bold-duotone"
                color={theme.vars.palette.info.main}
              />

              <UpdateProductAnalytic
                title="Completado"
                total={getCountByStatus('completed')}
                percent={jobs.length ? (getCountByStatus('completed') / jobs.length) * 100 : 0}
                icon="solar:file-check-bold-duotone"
                color={theme.vars.palette.success.main}
              />

              <UpdateProductAnalytic
                title="Fallido"
                total={getCountByStatus('failed')}
                percent={jobs.length ? (getCountByStatus('failed') / jobs.length) * 100 : 0}
                icon="solar:shield-warning-bold-duotone"
                color={theme.vars.palette.error.main}
              />

              <UpdateProductAnalytic
                title="Procesando"
                total={getCountByStatus('processing')}
                percent={jobs.length ? (getCountByStatus('processing') / jobs.length) * 100 : 0}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.vars.palette.warning.main}
              />

              <UpdateProductAnalytic
                title="Procesado con errores"
                total={getCountByStatus('processed_with_errors')}
                percent={jobs.length ? (getCountByStatus('processed_with_errors') / jobs.length) * 100 : 0}
                icon="solar:shield-warning-bold-duotone"
                color={theme.vars.palette.error.main}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={{
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                      'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh">
                    <IconButton color="primary" onClick={handleRefresh}>
                      {loading ? <CircularProgress size={20} /> : <Iconify icon="eva:refresh-fill" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {loading ? (
                    <TableRowPlaceholder count={table.rowsPerPage} />
                  ) : dataFiltered.length ? (
                    dataFiltered
                      .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                      .map((row) => (
                        <JobTableRow
                          key={row.id}
                          job={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                        />
                      ))
                  ) : (
                    <TableNoData notFound={notFound} />
                  )}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </HomeContent>

      {/* Bulk upload modal opened from this page */}
      <ProductUploadBulkDialog open={openBulk} onClose={() => setOpenBulk(false)} />
    </>
  );
}

// small placeholder row component while loading
function TableRowPlaceholder({ count = 5 }) {
  const placeholders = new Array(count).fill(0);
  return (
    <>
      {placeholders.map((_, i) => (
        <tr key={i}>
          <td colSpan={6} style={{ padding: 16 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.disabled">Loading …</Typography>
            </Box>
          </td>
        </tr>
      ))}
    </>
  );
}

export default UploadProductListView;
