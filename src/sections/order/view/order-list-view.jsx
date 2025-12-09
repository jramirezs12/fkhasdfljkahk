'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useDropshippingOrders } from "src/hooks/order/getDropshippingOrders";

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { HomeContent } from 'src/layouts/home';
import { adaptOrderList } from "src/actions/order/adapters/orderListAdapter";

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { ErrorContent } from 'src/components/error-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PermissionContent } from 'src/components/permission-content';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

import { OrderTableRow } from '../components/order-table-row';
import { OrderTableToolbar } from '../components/order-table-toolbar';
import { STATUS_COLORS, TABLE_ORDER_HEAD } from '../resources/constants';
import { OrderTableFiltersResult } from '../components/order-table-filters-result';

export function OrderListView() {
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user === null) {
      router.replace(paths.auth.login);
    }
  }, [user, router]);

  const table = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10
  });

  const { data, isLoading, isError } = useDropshippingOrders();
  const [tableData, setTableData] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);

  useEffect(() => {
    if (data) {
      const adapted = adaptOrderList(data);
      setDataStatus([
        'all',
        ...Array.from(new Set(adapted.map((o) => o.status)))
      ]);
      setTableData(adapted);
    }
  }, [data]);

  const filters = useSetState({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  if (user === null) {
    return null;
  } else if (user.dropshipping === null || user.dropshipping.status !== 'approved') {
    return (
      <HomeContent>
        <PermissionContent
          title="Acceso denegado"
          description="No tienes permiso para ver ordenes. Tu cuenta está pendiente de aprobación."
          sx={{ mt: 10 }}
        />
      </HomeContent>
    );
  }

  return (
    <HomeContent>
      {/* Breadcrumb + action button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 3, md: 5 } }}>
        <CustomBreadcrumbs
          heading="Mis Ordenes"
          links={[
            { name: 'Inicio', href: paths.home.root },
            { name: 'Lista de ordenes' },
          ]}
          sx={{ m: 0 }}
        />
        <Button
          variant="contained"
          onClick={() => router.push(paths.home.order.massive)}
          aria-label="Crear orden masiva"
          sx={{
            ml: 2,
            bgcolor: 'common.black',
            color: 'common.white',
            '&:hover': { bgcolor: 'grey.900' },
          }}
        >
          Crear orden masiva
        </Button>
      </Box>

      {isError ? (
        <ErrorContent
          title="Ordenes no disponibles"
          description="Lo sentimos, no pudimos cargar las órdenes en este momento. Por favor, intenta nuevamente más tarde."
          sx={{ mt: 0 }}
        />
      ) : (
        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {dataStatus.map((status) => (
              <Tab
                key={status}
                value={status}
                label={status === 'all' ? 'Todos' : status}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      (status === 'all' || status === currentFilters.status) ? 'filled' : 'soft'
                    }
                    color={STATUS_COLORS[status] || 'default'}
                  >
                    {status === 'all'
                      ? tableData.length
                      : tableData.filter((o) => o.status === status).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_ORDER_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {isLoading ? (
                    <TableSkeleton rowCount={10} cellCount={TABLE_ORDER_HEAD.length} sx={{ height: 69 }} />
                  ) : (
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <OrderTableRow
                          key={row.id}
                          row={row}
                          detailsHref={paths.home.order.details(row.id)}
                        />
                      ))
                  )}

                  {!isLoading && (
                    <TableEmptyRows
                      height={table.dense ? 56 : 56 + 20}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />
                  )}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            showDense={false}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}
    </HomeContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(({ orderNumber, customer }) =>
      [orderNumber, customer.name, customer.email].some((field) =>
        field?.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) => fIsBetween(order.createdAt, startDate, endDate));
    }
  }

  return inputData;
}
