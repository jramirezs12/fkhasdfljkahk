'use client';



import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function WarehouseLayout({ children, ...other }) {
  const pathname = usePathname();

  return (
    <HomeContent {...other}>
      <CustomBreadcrumbs
        heading="Sucursales"
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Sucursales' },
        ]}
        sx={{ mb: 3 }}
      />
      {children}
    </HomeContent>
  );
}
