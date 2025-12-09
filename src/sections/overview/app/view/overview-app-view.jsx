'use client';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { HomeContent } from 'src/layouts/home';
import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appFeatured, _appInvoices } from 'src/_mock';

import { useAuthContext } from 'src/auth/hooks';

import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppTopAuthors } from '../app-top-authors';
import { AppNewInvoices } from '../app-new-invoices';
import { BankingOverview } from '../banking-overview';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
 // añadí BankingOverview

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  return (
    <HomeContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <AppWelcome
            title={`¡Bienvenido de nuevo! 👋 \n ${user?.displayName}`}
            description="Si deseas conocer mejor nuestra herramienta de dropshipping, puedes hacer clic aquí para iniciar tu capacitación y aprovechar todas sus funciones."
            img={<SeoIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                Ir ahora
              </Button>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppFeatured list={_appFeatured} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Ventas"
            percent={2.6}
            total={18765}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Productos"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AppWidgetSummary
            title="Devoluciones"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppCurrentDownload
            title="Visitas a la página"
            subheader="Visitado por sistema operativo"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        {/* Aquí reemplazamos AppAreaInstalled por BankingOverview (categorías mas vistas -> BankingOverview) */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <BankingOverview
            title="Categorias mas vistas"
            subheader="(+43%) que el año pasado"
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <AppNewInvoices
            title="Ultimas ordenes"
            tableData={_appInvoices}
            headCells={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Categoria' },
              { id: 'price', label: 'Precio' },
              { id: 'status', label: 'Estado' },
              { id: '' },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AppTopAuthors title="Top vendedores" list={_appAuthors} />
        </Grid>
      </Grid>
    </HomeContent>
  );
}
