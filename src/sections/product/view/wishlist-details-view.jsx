'use client';

import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { HomeContent } from 'src/layouts/home';
import { fetchWishlists, removeProductsFromWishlist, deleteWishlist as apiDeleteWishlist } from 'src/actions/wishlist/wishlist';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { WishlistEditModal } from 'src/components/wishlist/wishlist-edit-modal';
import { useToolbarSettings, CustomGridActionsCellItem } from 'src/components/custom-data-grid';

import { WishListTableToolbar } from '../components/wishlist-table-toolbar';
import {
  RenderCellPrice,
  RenderCellProduct,
} from '../components/wishlist-table-row';

/**
 * Wishlist detail page rendered as a DataGrid (table) of products in the wishlist.
 *
 * Props:
 * - wishlistId: string | number
 *
 * Columns: name, sku, category, price, stock status, stock_saleable, quantity, provider
 */
export default function WishlistDetailsView({ wishlistId }) {
  const confirmDialog = useBoolean();
  const toolbarOptions = useToolbarSettings();
  const theme = useTheme();
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // Data fetching (SWR key 'wishlists' reused)
  const { data: lists = null, error, isValidating } = useSWR('wishlists', fetchWishlists, {
    revalidateOnFocus: false,
  });

  // table state
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({
    type: 'include',
    ids: new Set(),
  });

  const [filters, setFilters] = useState({ publish: [], stock: [] });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({ category: false });

  const [editOpen, setEditOpen] = useState(false);
  const [deletingWishlist, setDeletingWishlist] = useState(false);

  // find wishlist by id
  const wishlist = useMemo(() => {
    if (!Array.isArray(lists)) return null;
    return lists.find((l) => String(l.id) === String(wishlistId)) ?? null;
  }, [lists, wishlistId]);

  const rows = useMemo(() => {
    if (!wishlist) return [];
    const items = wishlist.items_v2?.items ?? [];
    return items.map((it) => {
      const p = it.product || {};
      const priceVal = p?.price?.regularPrice?.amount?.value ?? null;
      const currency = p?.price?.regularPrice?.amount?.currency ?? 'COP';
      const category = Array.isArray(p?.categories) && p.categories[0] ? p.categories[0].name : '-';
      const available = typeof p?.stock_saleable === 'number' ? p.stock_saleable : null;
      const stockStatus = p?.stock_status ?? '-';
      const providerName = p?.provider?.name ?? '-';
      const coverUrl = p?.image?.url ?? '/assets/placeholder.png';

      return {
        id: `${it.id}`,
        productId: p.id ?? p.sku ?? `${wishlist.id}-${it.id}`,
        name: p.name ?? '-',
        sku: p.sku ?? '-',
        coverUrl,
        category,
        createdAt: it.added_at ?? wishlist.updated_at ?? '',
        stockStatus,
        stockSaleable: available ?? 0,
        quantity: Number(it.quantity || 0),
        price: priceVal,
        currency,
        provider: providerName,
        raw: p,
        wishlistItemId: it.id,
      };
    });
  }, [wishlist]);

  useEffect(() => {
    setTableData(rows);
  }, [rows]);

  const canReset = (filters.publish && filters.publish.length) || (filters.stock && filters.stock.length);

  const dataFiltered = useMemo(() => {
    let input = tableData;
    const { stock, publish } = filters;
    if (Array.isArray(stock) && stock.length) {
      input = input.filter((r) => stock.includes(r.inventoryType));
    }
    return input;
  }, [tableData, filters]);

  // ---- Mutations for removing items (single + bulk) ----
  const handleDeleteRow = useCallback(
    async (id) => {
      // optimistic UI update
      setTableData((prev) => prev.filter((row) => row.id !== id));
      try {
        if (!wishlist?.id) throw new Error('Wishlist inválida');
        await removeProductsFromWishlist({ wishlistId: wishlist.id, wishlistItemsIds: [id] });
        toast.success('Item eliminado');
        await mutate('wishlists');
      } catch (err) {
        console.error(err);
        // If GraphQL returns structured errors, extract message
        const msg = err?.response?.errors?.[0]?.message || err?.message || 'Error eliminando item';
        await mutate('wishlists');
        toast.error(msg);
      }
    },
    [wishlist, mutate]
  );

  const handleDeleteRows = useCallback(
    async () => {
      const ids = Array.from(selectedRows.ids || []);
      if (!ids.length) return;
      // optimistic
      setTableData((prev) => prev.filter((row) => !ids.includes(row.id)));
      try {
        if (!wishlist?.id) throw new Error('Wishlist inválida');
        await removeProductsFromWishlist({ wishlistId: wishlist.id, wishlistItemsIds: ids });
        toast.success(`${ids.length} item(s) eliminados`);
        await mutate('wishlists');
        // clear selection UI
        setSelectedRows({ type: 'include', ids: new Set() });
      } catch (err) {
        console.error(err);
        const msg = err?.response?.errors?.[0]?.message || err?.message || 'Error eliminando items';
        await mutate('wishlists');
        toast.error(msg);
      }
    },
    [selectedRows, wishlist, mutate]
  );

  // ---- Edit / Delete wishlist ----
  const handleOpenEdit = () => setEditOpen(true);

  const handleUpdated = (updated) => {
    mutate('wishlists');
  };

  const handleDeleteWishlist = async () => {
    if (!wishlist?.id) return;
    if (!confirm('¿Eliminar esta lista? Esta acción no se puede deshacer.')) return;
    setDeletingWishlist(true);
    try {
      await apiDeleteWishlist({ wishlistId: wishlist.id });
      toast.success('Lista eliminada');
      await mutate('wishlists');
      router.push(paths.home.product.list);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.errors?.[0]?.message || err?.message || 'Error eliminando la lista';
      // Show GraphQL message (e.g. default wishlist can't be deleted)
      toast.error(msg);
      // don't navigate away
    } finally {
      setDeletingWishlist(false);
    }
  };

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Eliminar"
      content={
        <>
          Are you sure want to delete <strong> {selectedRows.ids.size} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            await handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Eliminar
        </Button>
      }
    />
  );

  // columns adapted to new fields
  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Nombre',
        flex: 1,
        minWidth: 300,
        renderCell: (params) =>
          RenderCellProduct({
            params: {
              row: {
                id: params.row.productId,
                name: params.row.name,
                coverUrl: params.row.coverUrl,
                category: params.row.category,
              },
            },
            href: paths.home.product.details(params.row.sku),
          }),
      },
      {
        field: 'sku',
        headerName: 'SKU',
        width: 140,
        renderCell: (params) => <Box sx={{ typography: 'body2' }}>{params.row.sku ?? '-'}</Box>,
      },
      {
        field: 'category',
        headerName: 'Categoria',
        width: 180,
        renderCell: (params) => <Box sx={{ typography: 'body2', color: 'text.secondary' }}>{params.row.category ?? '-'}</Box>,
      },
      {
        field: 'price',
        headerName: 'Precio',
        width: 140,
        renderCell: (params) =>
          RenderCellPrice({
            params: {
              row: {
                price: params.row.price,
                currency: params.row.currency,
              },
            },
          }),
      },
      {
        field: 'stockStatus',
        headerName: 'Estado stock',
        width: 140,
        renderCell: (params) => (
          <Box sx={{ typography: 'caption', color: params.row.stockStatus === 'IN_STOCK' || params.row.stockStatus === 'in stock' ? 'success.main' : 'text.secondary' }}>
            {params.row.stockStatus ?? '-'}
          </Box>
        ),
      },
      {
        field: 'stockSaleable',
        headerName: 'Stock',
        width: 120,
        renderCell: (params) => <Box sx={{ typography: 'body2' }}>{Number(params.row.stockSaleable ?? 0)}</Box>,
      },
      {
        field: 'quantity',
        headerName: 'Cantidad',
        width: 110,
        renderCell: (params) => <Box sx={{ typography: 'body2' }}>{Number(params.row.quantity ?? 0)}</Box>,
      },
      {
        field: 'provider',
        headerName: 'Proveedor',
        width: 180,
        renderCell: (params) => <Box sx={{ typography: 'body2' }}>{params.row.provider ?? '-'}</Box>,
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: ' ',
        width: 120,
        align: 'right',
        headerAlign: 'right',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        getActions: (params) => [
          <CustomGridActionsCellItem
            key="view"
            showInMenu
            label="Ver producto"
            icon={<Iconify icon="solar:eye-bold" />}
            href={paths.home.product.details(params.row.sku)}
          />,
          <CustomGridActionsCellItem
            key="remove"
            showInMenu
            label="Eliminar"
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => handleDeleteRow(params.row.id)}
            style={{ color: theme.vars.palette.error.main }}
          />,
        ],
      },
    ],
    [handleDeleteRow, theme.vars.palette.error.main]
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error cargando la lista: {String(error?.message ?? error)}</Typography>
      </Box>
    );
  }

  if (lists === null || wishlist === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <HomeContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading={wishlist?.name ?? 'Lista'}
          links={[
            { name: 'Inicio', href: paths.home.root },
            { name: 'Mis Productos', href: paths.home.product.root },
            { name: 'Mis Listas' },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} href={paths.home.product.list} variant="outlined">
                Volver a mis listas
              </Button>

              <Button variant="outlined" onClick={handleOpenEdit}>
                Editar lista
              </Button>

              <Button variant="contained" color="error" onClick={handleDeleteWishlist} disabled={deletingWishlist}>
                {deletingWishlist ? <CircularProgress size={16} /> : 'Eliminar lista'}
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            minHeight: 400,
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 600, md: '1px' },
            flexDirection: { md: 'column' },
          }}
        >

<DataGrid
  {...toolbarOptions.settings}
  disableRowSelectionOnClick
  rows={dataFiltered}
  columns={columns}
  loading={isValidating}
  getRowHeight={() => 'auto'}
  pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
  onRowSelectionModelChange={(newSelectionModel) =>
    setSelectedRows((prev) => {
      // normalize ids as strings (DataGrid may return numbers)
      const set = new Set((newSelectionModel || []).map((v) => String(v)));
      return { ...prev, ids: set };
    })
  }

  /* ---- NEW: also intercept mousedown to stop propagation very early ---- */
  onCellMouseDown={(params, event) => {
    const target = event?.target;
    try {
      if (target instanceof HTMLElement) {
        if (
          target.closest('input[type="checkbox"]') ||
          target.closest('[role="checkbox"]') ||
          target.closest('label') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('svg')
        ) {
          // Stop the mousedown from bubbling up and being interpreted as row click/navigation
          event.stopPropagation();
        }
      }
    } catch (err) {
      // ignore
    }
  }}

  onCellClick={(params, event) => {
    const target = event?.target;
    try {
      if (target instanceof HTMLElement) {
        if (
          target.closest('input[type="checkbox"]') ||
          target.closest('[role="checkbox"]') ||
          target.closest('label') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('svg')
        ) {
          event.stopPropagation();
        }
      }
    } catch (err) {
      // ignore
    }
  }}

  onRowClick={(params, event) => {
    const target = event?.target;
    try {
      if (target instanceof HTMLElement) {
        if (
          target.closest('input[type="checkbox"]') ||
          target.closest('[role="checkbox"]') ||
          target.closest('label') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('svg')
        ) {
          // Prevent row click action when the user interacted with an inner control
          event.stopPropagation();
          event.preventDefault?.();
          return;
        }
      }
    } catch (err) {
      // ignore
    }
    // otherwise allow row click behavior (if any)
  }}

  slots={{
    noRowsOverlay: () => <EmptyContent />,
    noResultsOverlay: () => <EmptyContent title="No results found" />,
    toolbar: () => (
      <WishListTableToolbar
        filters={{ state: filters, setState: setFilters }}
        canReset={!!canReset}
        filteredResults={dataFiltered.length}
        selectedRowCount={selectedRows.ids.size}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
        options={{ stocks: [{ value: 'in stock', label: 'In stock' }, { value: 'out of stock', label: 'Out of stock' }], publishs: [] }}
        settings={toolbarOptions.settings}
        onChangeSettings={toolbarOptions.onChangeSettings}
      />
    ),
  }}
  /* rest of props unchanged... */
  slotProps={{
    columnsManagement: {
      getTogglableColumns: () =>
        columns.filter((col) => !['actions'].includes(col.field)).map((col) => col.field),
    },
  }}
  sx={{
    [`& .${gridClasses.cell}`]: {
      display: 'flex',
      alignItems: 'center',
    },
  }}
/>
        </Card>
      </HomeContent>

      {renderConfirmDialog()}

      <WishlistEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        wishlist={wishlist}
        onUpdated={handleUpdated}
        onDeleted={() => {
          mutate('wishlists');
          router.push(paths.home.product.list);
        }}
      />
    </>
  );
}
