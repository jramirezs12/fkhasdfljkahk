'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';

import { useRouter } from 'src/routes/hooks';

import SiigoIntegrationDialog from './siigo-integration-dialog';
import { ProductIntegrationCard } from './product-integration-card';

export function ProductIntegrationList() {
  const router = useRouter();

  // Estado para abrir el modal de Siigo
  const [openSiigoDialog, setOpenSiigoDialog] = useState(false);

  const integrations = [
    {
      key: 'shopify',
      name: 'Shopify',
      logoUrl: '/logo/shopify.svg',
      description: 'Crea tu tienda, personaliza tu diseño y gestiona productos en múltiples monedas.',
      lastUpdated: '2025-10-30T00:00:00Z',
      href: '/home/product/integrations/shopify',
    },
    {
      key: 'siigo',
      name: 'Siigo',
      logoUrl: '/logo/Siigo.webp',
      description: 'Software Contable y Administrativo para micro, pequeñas y medianas empresas.',
      lastUpdated: '2025-10-22T00:00:00Z',
      href: '/home/product/integrations/siigo',
    },
    {
      key: 'woocommerce',
      name: 'WooCommerce',
      logoUrl: '/logo/WooCommerce.svg',
      description: 'Personaliza tu diseño, vende tus productos físicos, y gestiona tu inventario.',
      lastUpdated: '2025-09-18T00:00:00Z',
      href: '/home/product/integrations/woocommerce',
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
        }}
      >
        {integrations.map((it) => (
          <ProductIntegrationCard
            key={it.key}
            integrator={it}
            detailsHref={it.href}
            // Para Siigo abrimos el modal de integración; para el resto navegamos a la ruta específica
            onIntegrate={() => {
              if (it.key === 'siigo') {
                setOpenSiigoDialog(true);
              } else {
                router.push(it.href);
              }
            }}
          />
        ))}
      </Box>

      {/* Modal de integración Siigo con pasos: credenciales -> acciones de importación */}
      <SiigoIntegrationDialog open={openSiigoDialog} onClose={() => setOpenSiigoDialog(false)} />
    </>
  );
}

export default ProductIntegrationList;
