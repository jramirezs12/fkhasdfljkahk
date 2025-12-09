import { CONFIG } from 'src/global-config';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Inicio - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewAppView />;
}
