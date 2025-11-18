'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductUploadList } from '../components/product-upload-list';

// ----------------------------------------------------------------------

export function UploadProductView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Cargar Archivos"
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Mis Productos', href: paths.home.product.root },
          { name: 'Carga' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductUploadList />
    </HomeContent>
  );
}
