import { CONFIG } from 'src/global-config';

import { SiigoIntegrationHistoryView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Lista de integraciones - ${CONFIG.appName}` };

export default function Page() {
  return <SiigoIntegrationHistoryView />;
}
