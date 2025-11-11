'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { HomeContent } from 'src/layouts/home';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserCardList } from '../user-card-list';

// ----------------------------------------------------------------------

export function UserCardsView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Bodegas"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'User', href: paths.home.user.root },
          { name: 'Bodegas' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.home.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add user
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCardList users={_userCards} />
    </HomeContent>
  );
}
