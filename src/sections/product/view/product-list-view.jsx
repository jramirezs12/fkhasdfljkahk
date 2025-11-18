'use client';

import { orderBy } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { HomeContent } from 'src/layouts/home';
import { useProductFeedStore } from 'src/store/productFeed';
import { useGetCategories } from 'src/actions/category/category';
import { useInfiniteProducts } from 'src/actions/product/product';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductList } from '../components/product-list';
import { ProductSort } from '../components/product-sort';
import { ProductSearch } from '../components/product-search';
import { ProductFilters } from '../components/product-filters';
import { ProductTableFiltersResult as ProductFiltersResult } from '../components/product-table-filters-result';

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export function ProductListView() {
  const openFilters = useBoolean();

  const categories = useProductFeedStore((s) => s.categories);
  const stock = useProductFeedStore((s) => s.stock);
  const publish = useProductFeedStore((s) => s.publish);
  const setCategories = useProductFeedStore((s) => s.setCategories);
  const setStock = useProductFeedStore((s) => s.setStock);
  const setPublish = useProductFeedStore((s) => s.setPublish);
  const resetFilters = useProductFeedStore((s) => s.reset);

  const filters = {
    state: { categories, stock, publish },
    setState: (patch) => {
      if (patch.categories !== undefined) setCategories(patch.categories);
      if (patch.stock !== undefined) setStock(patch.stock);
      if (patch.publish !== undefined) setPublish(patch.publish);
    },
    resetState: () => resetFilters(),
  };
  const currentFilters = filters.state;

  const { categoriesOptions } = useGetCategories();

  const serverFilter = useMemo(() => {
    const f = {};
    if (currentFilters.categories.length) {
      f.category_uid = { in: currentFilters.categories };
    }
    return f;
  }, [currentFilters.categories]);

  const { products, productsLoading, productsError, hasMore, isLoadingMore, loadMore } =
    useInfiniteProducts({ filter: serverFilter, pageSize: 18 });

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
    <HomeContent>
      <CustomBreadcrumbs
        heading="Lista"
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Mis Productos', href: paths.home.product.root },
          { name: 'Lista' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.home.product.create}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add product
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
        ZZZ
      />

      {productsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error cargando productos. Revisa consola (pueden existir errores parciales).
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
          <ProductSearch redirectPath={(id) => paths.home.product.details(id)} />

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <ProductFilters
              filters={filters}
              canReset={canReset}
              open={openFilters.value}
              onOpen={openFilters.onTrue}
              onClose={openFilters.onFalse}
              options={{
                categories: categoriesOptions, // [{ value, label }]
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

        {canReset && <ProductFiltersResult filters={filters} totalResults={dataFiltered.length} />}
      </Stack>

      {notFound && <EmptyContent filled sx={{ py: 10 }} />}

      <ProductList
        products={dataFiltered}
        loading={productsLoading && dataFiltered.length === 0}
        loadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </HomeContent>
  );
}

/**
 * applyFilter
 * Filtros y ordenamiento en cliente sobre la lista acumulada.
 * - sortBy: latest | oldest | priceDesc | priceAsc
 * - categories, stock, publish: arrays de valores activos
 */
function applyFilter({ inputData, filters, sortBy }) {
  const { categories, stock, publish } = filters;
  let data = Array.isArray(inputData) ? [...inputData] : [];

  // Orden
  if (sortBy === 'latest') data = orderBy(data, ['createdAt'], ['desc']);
  else if (sortBy === 'oldest') data = orderBy(data, ['createdAt'], ['asc']);
  else if (sortBy === 'priceDesc') data = orderBy(data, ['price'], ['desc']);
  else if (sortBy === 'priceAsc') data = orderBy(data, ['price'], ['asc']);

  // Filtro por categorías (intersección de categoryUids)
  if (categories.length) {
    data = data.filter((p) => p.categoryUids?.some((uid) => categories.includes(uid)));
  }

  // Filtro por estado de inventario
  if (stock.length) {
    data = data.filter((p) => stock.includes(p.inventoryType));
  }

  // Filtro por publish (en este ejemplo todos vienen 'published', placeholder)
  if (publish.length) {
    data = data.filter((p) => publish.includes(p.publish));
  }

  return data;
}
