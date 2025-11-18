'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductCreateEditForm } from '../components/product-create-edit-form';

// ----------------------------------------------------------------------

export function ProductEditView({ product }) {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.home.product.root}
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Product', href: paths.home.product.root },
          { name: product?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductCreateEditForm currentProduct={product} />
    </HomeContent>
  );
}
