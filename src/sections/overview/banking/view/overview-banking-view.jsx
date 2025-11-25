'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { HomeContent } from 'src/layouts/home';
import { _bankingContacts, _bankingCreditCard, _bankingRecentTransitions } from 'src/_mock';

import { BankingOverview } from '../banking-overview';
import { BankingQuickTransfer } from '../banking-quick-transfer';
import { BankingCurrentBalance } from '../banking-current-balance';
import { BankingRecentTransitions } from '../banking-recent-transitions';

// ----------------------------------------------------------------------

export function OverviewBankingView() {
  return (
    <HomeContent maxWidth="xl">
      < Grid container spacing={3} >
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <BankingOverview />

            <BankingRecentTransitions
              title="Transiciones recientes"
              tableData={_bankingRecentTransitions}
              headCells={[
                { id: 'description', label: 'Descripción' },
                { id: 'date', label: 'Fecha' },
                { id: 'amount', label: 'Cantidad' },
                { id: 'status', label: 'Estado' },
                { id: '' },
              ]}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <BankingCurrentBalance list={_bankingCreditCard} />

            <BankingQuickTransfer title="Transferencia" list={_bankingContacts} />

          </Box>
        </Grid>
      </Grid >
    </HomeContent >
  );
}
