import { CONFIG } from 'src/global-config';

import { OrderMassiveView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Crear Orden - ${CONFIG.appName}` };

export default function Page() {
  return <OrderMassiveView />;
}
