'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { HomeContent } from 'src/layouts/home';
import { getSiigoIntegrationHistory } from 'src/actions/upload/integrations';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

const TABLE_HEAD = [
  { id: 'type', label: 'Tipo' },
  { id: 'created_at', label: 'Creado' },
  { id: 'source', label: 'Origen' },
  { id: 'result', label: 'Resumen' },
  { id: 'errores', label: 'Errores', align: 'right' },
];

function formatDate(dt) {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    return d.toLocaleString();
  } catch {
    return dt;
  }
}

export function SiigoIntegrationHistoryView() {
  const table = useTable({ defaultOrderBy: 'created_at' });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const filters = useSetState({ type: 'all' });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const resp = await getSiigoIntegrationHistory();
    setLoading(false);
    if (!resp.ok) {
      toast.error(resp.error || 'Error obteniendo historial');
      return;
    }
    const data = Array.isArray(resp.data) ? resp.data : [];
    const normalized = data.map((it, i) => ({ ...it, id: it.id || `int_${i}` }));
    setItems(normalized);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const dataFiltered = useMemo(() => {
    let input = [...items];
    if (filters.state.type !== 'all') {
      input = input.filter((it) => String(it.type).toLowerCase() === String(filters.state.type).toLowerCase());
    }
    input.sort((a, b) => getComparator(table.order, table.orderBy)(a, b));
    return input;
  }, [items, filters.state.type, table.order, table.orderBy]);

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);
  const notFound = !dataFiltered.length;

  const getCountByType = (t) =>
    items.filter((it) => String(it.type).toLowerCase() === String(t).toLowerCase()).length;

  const TABS = [
    { value: 'all', label: 'Todos', color: 'default', count: items.length },
    { value: 'warehouses', label: 'Bodegas', color: 'info', count: getCountByType('warehouses') },
    { value: 'products', label: 'Productos', color: 'success', count: getCountByType('products') },
  ];

  const handleFilterType = (e, newValue) => {
    table.onResetPage();
    filters.setState({ type: newValue });
  };

  const handleRefresh = () => {
    fetchHistory();
    toast.success('Historial actualizado');
  };

  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Historial Integraciones Siigo"
        links={[
          { name: 'Home', href: '/' },
          { name: 'Integraciones', href: '/product/integrations' },
          { name: 'Siigo Historial' },
        ]}
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:refresh-fill" />} onClick={handleRefresh}>
            Refresh
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.state.type}
          onChange={handleFilterType}
          sx={{
            px: { md: 2.5 },
            boxShadow: `inset 0 -2px 0 0 ${varAlpha('rgba(145,158,171,0.5)', 0.08)}`,
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
                    ((tab.value === 'all' || tab.value === filters.state.type) && 'filled') || 'soft'
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
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((r) => r.id)
              )
            }
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Actualizar">
                  <IconButton color="primary" onClick={handleRefresh}>
                    {loading ? <CircularProgress size={20} /> : <Iconify icon="eva:refresh-fill" />}
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />

          <Scrollbar sx={{ minHeight: 440 }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : dataInPage.length ? (
                  dataInPage.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{formatDate(row.created_at)}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell>
                        {row.result
                          ? `Creados: ${row.result.creados} / No creados: ${row.result.no_creados}`
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {row.errores && row.errores.length ? (
                          <Tooltip
                            title={
                              <Box sx={{ maxWidth: 320 }}>
                                {row.errores.map((er, i) => (
                                  <Typography
                                    key={i}
                                    variant="caption"
                                    sx={{ display: 'block', whiteSpace: 'normal' }}
                                  >
                                    {er}
                                  </Typography>
                                ))}
                              </Box>
                            }
                          >
                            <Label color="error" variant="soft">
                              {row.errores.length} error{row.errores.length > 1 ? 'es' : ''}
                            </Label>
                          </Tooltip>
                        ) : (
                          <Label color="success" variant="soft">
                            OK
                          </Label>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableNoData notFound={notFound} />
                )}

                <TableEmptyRows
                  height={table.dense ? 56 : 76}
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
  );
}

export default SiigoIntegrationHistoryView;
