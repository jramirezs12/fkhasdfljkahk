'use client';

import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname, useSearchParams } from 'src/routes/hooks';

import { HomeContent } from 'src/layouts/home';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Reuse existing small components to match user profile layout if available
import { ProfileCover } from 'src/sections/user/components/profile-cover';
import { ProductList } from 'src/sections/product/components/product-list';

// ----------------------------------------------------------------------
// Tabs for provider profile — keep similar to user profile but focus on products
const NAV_ITEMS = [
  { value: '', label: 'Productos', icon: <Iconify width={24} icon="ic:round-shopping-bag" /> },
  { value: 'profile', label: 'Perfil', icon: <Iconify width={24} icon="solar:user-id-bold" /> },
];

const TAB_PARAM = 'tab';

// ----------------------------------------------------------------------

export function ProviderProfileView({
  provider = null,
  products = [],
  productsLoading = false,
  productsLoadingMore = false,
  productsHasMore = false,
  onLoadMore = null,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get(TAB_PARAM) ?? '';

  const providerName = provider?.name ?? `Proveedor ${provider?.id ?? ''}`;
  const providerId = provider?.id ?? '';

  const [followed, setFollowed] = useState(false);
  const handleFollow = useCallback(() => setFollowed((s) => !s), []);

  const createRedirectPath = useCallback(
    (currentPath, query) => {
      const queryString = new URLSearchParams({ [TAB_PARAM]: query }).toString();
      return query ? `${currentPath}?${queryString}` : currentPath;
    },
    []
  );

  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading={providerName}
        links={[
          { name: 'Inicio', href: paths.home.root },
          { name: 'Proveedores', href: paths.home.store.root },
          { name: providerName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 290, position: 'relative' }}>
        {/* ProfileCover used to mimic user profile look & feel */}
        <ProfileCover role="Proveedor" name={providerName} avatarUrl={undefined} coverUrl={undefined} />

        <Box
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            display: 'flex',
            position: 'absolute',
            bgcolor: 'background.paper',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <Tabs value={selectedTab}>
            {NAV_ITEMS.map((tab) => (
              <Tab
                component={RouterLink}
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={tab.label}
                href={createRedirectPath(pathname, tab.value)}
              />
            ))}
          </Tabs>
        </Box>
      </Card>


      {/* Tab content with spacing to mirror UserProfileView */}
      {selectedTab === 'profile' && (
        <Box sx={{ mt: 3 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Acerca del proveedor
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {provider?.description ?? 'Este proveedor no tiene descripción pública.'}
            </Typography>
          </Card>
        </Box>
      )}

      {selectedTab === '' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Productos del proveedor
          </Typography>

          <ProductList
            products={products}
            loading={productsLoading && products.length === 0}
            loadingMore={productsLoadingMore}
            hasMore={productsHasMore}
            onLoadMore={onLoadMore}
          />
        </Box>
      )}
    </HomeContent>
  );
}

ProviderProfileView.propTypes = {
  provider: PropTypes.object,
  products: PropTypes.array,
  productsLoading: PropTypes.bool,
  productsLoadingMore: PropTypes.bool,
  productsHasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
};

export default ProviderProfileView;
