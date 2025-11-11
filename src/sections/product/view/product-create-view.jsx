'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductCreateEditForm } from '../product-create-edit-form';

// ----------------------------------------------------------------------

export function ProductCreateView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Create a new product"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Product', href: paths.home.product.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductCreateEditForm />
    </HomeContent>
  );
}
