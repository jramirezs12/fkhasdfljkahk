'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductCreateForm } from '../components/product-create-form';

// ----------------------------------------------------------------------

export function ProductCreateView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Creación de producto"
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Mis productos', href: paths.home.product.root },
          { name: 'Crear producto' },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      <ProductCreateForm />
    </HomeContent>
  );
}
