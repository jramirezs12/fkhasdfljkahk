'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserCreateEditForm } from '../user-create-edit-form';

// ----------------------------------------------------------------------

export function UserEditView({ user: currentUser }) {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.home.user.list}
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'User', href: paths.home.user.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCreateEditForm currentUser={currentUser} />
    </HomeContent>
  );
}
