'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { usePathname, useSearchParams } from 'src/routes/hooks';

import { HomeContent } from 'src/layouts/home';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Usa el usuario real del contexto (no el mock)
import { useAuthContext } from 'src/auth/hooks';

import { ProfileHome } from '../profile-home';
import { ProfileCover } from '../profile-cover';
import { ProfileFriends } from '../profile-friends';
import { ProfileDocuments } from '../profile-documents';
import { ProfileFollowers } from '../profile-followers';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { value: '', label: 'Perfil', icon: <Iconify width={24} icon="solar:user-id-bold" /> },
  { value: 'followers', label: 'Followers', icon: <Iconify width={24} icon="solar:heart-bold" /> },
  {
    value: 'friends',
    label: 'Bodegas',
    icon: <Iconify width={24} icon="solar:users-group-rounded-bold" />,
  },
  {
    value: 'documents',
    label: 'Documentos',
    icon: <Iconify width={24} icon="solar:document-add-bold" />,
  },
];

// ----------------------------------------------------------------------

const TAB_PARAM = 'tab';

export function UserProfileView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams.get(TAB_PARAM) ?? '';

  // Usuario real desde AuthProvider (GraphQL customer)
  const { user } = useAuthContext();

  // Normaliza nombre y correo
  const firstName = (user?.firstName ?? user?.firstname ?? '').trim();
  const lastName = (user?.lastName ?? user?.lastname ?? '').trim();
  const displayName =
    user?.displayName ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Usuario';
  const email = user?.email || '';

  const [searchFriends, setSearchFriends] = useState('');

  const handleSearchFriends = useCallback((event) => {
    setSearchFriends(event.target.value);
  }, []);

  const createRedirectPath = (currentPath, query) => {
    const queryString = new URLSearchParams({ [TAB_PARAM]: query }).toString();
    return query ? `${currentPath}?${queryString}` : currentPath;
  };

  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Perfil"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Usuario', href: paths.home.user?.root ?? paths.home.root },
          { name: displayName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 290, position: 'relative' }}>
        <ProfileCover
          role={_userAbout.role}
          name={displayName}
          avatarUrl={undefined}
          coverUrl={_userAbout.coverUrl}
        />

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

      {selectedTab === '' && <ProfileHome info={_userAbout} posts={_userFeeds} sx={{ mt: 3 }} />}

      {selectedTab === 'followers' && <ProfileFollowers followers={_userFollowers} />}

      {selectedTab === 'friends' && (
        <ProfileFriends
          friends={_userFriends}
          searchFriends={searchFriends}
          onSearchFriends={handleSearchFriends}
        />
      )}

      {selectedTab === 'documents' && <ProfileDocuments documents={_userGallery} />}
    </HomeContent>
  );
}
