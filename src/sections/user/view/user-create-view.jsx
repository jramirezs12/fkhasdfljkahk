'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserCreateEditForm } from '../components/user-create-edit-form';

// ----------------------------------------------------------------------

export function UserCreateView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Create a new user"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'User', href: paths.home.user.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCreateEditForm />
    </HomeContent>
  );
}
