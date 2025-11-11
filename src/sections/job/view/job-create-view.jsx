'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { JobCreateEditForm } from '../job-create-edit-form';

// ----------------------------------------------------------------------

export function JobCreateView() {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Create a new job"
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Job', href: paths.home.job.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <JobCreateEditForm />
    </HomeContent>
  );
}
