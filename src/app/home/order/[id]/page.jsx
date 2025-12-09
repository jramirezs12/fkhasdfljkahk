import { CONFIG } from 'src/global-config';

import OrderDetailsClient from 'src/sections/order/orderDetailsClient';

export const metadata = { title: `Detalles de Orden - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;
  return <OrderDetailsClient id={id} />;
}