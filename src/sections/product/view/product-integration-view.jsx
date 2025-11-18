'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductIntegrationList } from '../components/product-integration-list';

export function IntegrationProductView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Integraciones"
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Productos', href: paths.home.product.root },
          { name: 'Carga', href: paths.home.product.upload },
          { name: 'Integraciones' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductIntegrationList />
    </HomeContent>
  );
}
