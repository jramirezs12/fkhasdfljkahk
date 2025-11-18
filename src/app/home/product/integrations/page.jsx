import { CONFIG } from 'src/global-config';

import { IntegrationProductView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Integraciones - ${CONFIG.appName}` };

export default function Page() {
  return <IntegrationProductView />;
}
