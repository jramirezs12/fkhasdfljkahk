'use client';

import { removeLastSlash } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { HomeContent } from 'src/layouts/home';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    label: 'General',
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
    href: paths.home.user.account,
  },
  // {
  //   label: 'Billing',
  //   icon: <Iconify width={24} icon="solar:bill-list-bold" />,
  //   href: `${paths.home.user.account}/billing`,
  // },
  // {
  //   label: 'Notifications',
  //   icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
  //   href: `${paths.home.user.account}/notifications`,
  // },
  {
    label: 'Documentos',
    icon: <Iconify width={24} icon="solar:document-add-bold" />,
    href: `${paths.home.user.account}/documents`,
  },
  // {
  //   label: 'Security',
  //   icon: <Iconify width={24} icon="ic:round-vpn-key" />,
  //   href: `${paths.home.user.account}/change-password`,
  // },
];

// ----------------------------------------------------------------------

export function AccountLayout({ children, ...other }) {
  const pathname = usePathname();

  return (
    <HomeContent {...other}>
      <CustomBreadcrumbs
        heading="Cuenta"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Usuario', href: paths.home.user.root },
          { name: 'Cuenta' },
        ]}
        sx={{ mb: 3 }}
      />

      <Tabs value={removeLastSlash(pathname)} sx={{ mb: { xs: 3, md: 5 } }}>
        {NAV_ITEMS.map((tab) => (
          <Tab
            component={RouterLink}
            key={tab.href}
            label={tab.label}
            icon={tab.icon}
            value={tab.href}
            href={tab.href}
          />
        ))}
      </Tabs>

      {children}
    </HomeContent>
  );
}
