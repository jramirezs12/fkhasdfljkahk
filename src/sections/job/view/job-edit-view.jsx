'use client';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { JobCreateEditForm } from '../job-create-edit-form';

// ----------------------------------------------------------------------

export function JobEditView({ job }) {
  return (
    <HomeContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.home.job.root}
        links={[
          { name: 'Home', href: paths.home.root },
          { name: 'Job', href: paths.home.job.root },
          { name: job?.title },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <JobCreateEditForm currentJob={job} />
    </HomeContent>
  );
}
