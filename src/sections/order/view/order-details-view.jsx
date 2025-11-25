'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { OrderDetailsItems } from '../components/order-details-items';
import { OrderDetailsToolbar } from '../components/order-details-toolbar';
import { OrderDetailsPayment } from '../components/order-details-payment';
import { OrderDetailsCustomer } from '../components/order-details-customer';
import { OrderDetailsDelivery } from '../components/order-details-delivery';
import { OrderDetailsShipping } from '../components/order-details-shipping';

// ----------------------------------------------------------------------

export function OrderDetailsView({ order }) {

  return (
    <HomeContent>
      <OrderDetailsToolbar
        status={order?.status}
        createdAt={order?.createdAt}
        orderNumber={order?.orderNumber}
        backHref={paths.home.order.root}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{ gap: 3, display: 'flex', flexDirection: { xs: 'column-reverse', md: 'column' } }}
          >
            <OrderDetailsItems
              items={order?.items}
              taxes={order?.taxes}
              shipping={order?.shipping}
              discount={order?.discount}
              subtotal={order?.subtotal}
              totalAmount={order?.totalAmount}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <OrderDetailsCustomer customer={order?.customer} />

            {order.delivery.trackingNumber && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <OrderDetailsDelivery delivery={order?.delivery} />
              </>
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />
            <OrderDetailsShipping shippingAddress={order?.shippingAddress} />

            <Divider sx={{ borderStyle: 'dashed' }} />
            <OrderDetailsPayment payment={order?.payment} />
          </Card>
        </Grid>
      </Grid>
    </HomeContent>
  );
}
