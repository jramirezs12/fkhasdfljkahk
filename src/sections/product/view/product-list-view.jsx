'use client';

import { orderBy } from 'es-toolkit';
import { useMemo, useState, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetCategories } from 'src/actions/category';
import { DashboardContent } from 'src/layouts/dashboard';
import { useInfiniteProducts } from 'src/actions/product';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductList } from '../product-list';
import { ProductSort } from '../product-sort';
import { ProductSearch } from '../product-search';
import { ProductFilters } from '../product-filters';
import { ProductTableFiltersResult as ProductFiltersResult } from '../product-table-filters-result';

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export function ProductListView() {
  const openFilters = useBoolean();

  const filters = useSetState({
    categories: [],
    stock: [],
    publish: [],
  });
  const { state: currentFilters } = filters;

  const { categoriesOptions } = useGetCategories();

  const serverFilter = useMemo(() => {
    const f = {};
    if (currentFilters.categories.length) {
      f.category_uid = { in: currentFilters.categories };
    }
    return f;
  }, [currentFilters.categories]);

  // Lotes más chicos para respuestas más rápidas
  const {
    products,
    productsLoading,
    productsError,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useInfiniteProducts({ filter: serverFilter, pageSize: 18 });

  const stockOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p?.inventoryType) set.add(p.inventoryType);
    });
    return Array.from(set).map((v) => ({ value: v, label: v.replace(/_/g, ' ') }));
  }, [products]);

  const [sortBy, setSortBy] = useState('latest');
  const handleSortBy = useCallback((v) => setSortBy(v), []);

  const canReset =
    currentFilters.categories.length > 0 ||
    currentFilters.stock.length > 0 ||
    currentFilters.publish.length > 0;

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: products,
        filters: currentFilters,
        sortBy,
      }),
    [products, currentFilters, sortBy]
  );

  const notFound = !productsLoading && !dataFiltered.length && canReset;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Product', href: paths.dashboard.product.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.product.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add product
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {productsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error cargando productos. Revisa consola (partial errors).
        </Alert>
      )}

      <Stack spacing={2.5} sx={{ mb: { xs: 3, md: 5 } }}>
        <Stack
          sx={{
            gap: 3,
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-end', sm: 'center' },
          }}
        >
          <ProductSearch redirectPath={(id) => paths.dashboard.product.details(id)} />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <ProductFilters
              filters={filters}
              canReset={canReset}
              open={openFilters.value}
              onOpen={openFilters.onTrue}
              onClose={openFilters.onFalse}
              options={{
                categories: categoriesOptions,
                stocks: stockOptions,
                publishs: PUBLISH_OPTIONS,
              }}
            />
            <ProductSort
              sort={sortBy}
              onSort={handleSortBy}
              sortOptions={[
                { value: 'latest', label: 'Latest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'priceDesc', label: 'Price: High to low' },
                { value: 'priceAsc', label: 'Price: Low to high' },
              ]}
            />
          </Stack>
        </Stack>

        {canReset && (
          <ProductFiltersResult filters={filters} totalResults={dataFiltered.length} />
        )}
      </Stack>

      {notFound && <EmptyContent filled sx={{ py: 10 }} />}

      <ProductList
        products={dataFiltered}
        loading={productsLoading && dataFiltered.length === 0}
        loadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </DashboardContent>
  );
}

function applyFilter({ inputData, filters, sortBy }) {
  const { categories, stock, publish } = filters;
  let data = Array.isArray(inputData) ? [...inputData] : [];

  if (sortBy === 'latest') data = orderBy(data, ['createdAt'], ['desc']);
  else if (sortBy === 'oldest') data = orderBy(data, ['createdAt'], ['asc']);
  else if (sortBy === 'priceDesc') data = orderBy(data, ['price'], ['desc']);
  else if (sortBy === 'priceAsc') data = orderBy(data, ['price'], ['asc']);

  if (categories.length) {
    data = data.filter((p) => p.categoryUids?.some((uid) => categories.includes(uid)));
  }
  if (stock.length) {
    data = data.filter((p) => stock.includes(p.inventoryType));
  }
  if (publish.length) {
    data = data.filter((p) => publish.includes(p.publish));
  }

  return data;
}
