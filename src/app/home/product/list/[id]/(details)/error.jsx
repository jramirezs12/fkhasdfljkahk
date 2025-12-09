'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { HomeContent } from 'src/layouts/home';

import { Iconify } from 'src/components/iconify';
import { ErrorContent } from 'src/components/error-content';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <HomeContent maxWidth={false} sx={{ pt: 5 }}>
      <ErrorContent
        filled
        title="Lista no enconsdftrada!"
        action={
          <Button
            component={RouterLink}
            href={paths.home.product.list}
            startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
            sx={{ mt: 3 }}
          >
            Volver a la listaasdf
          </Button>
        }
        sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
      />
    </HomeContent>
  );
}
