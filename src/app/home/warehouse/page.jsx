import { CONFIG } from 'src/global-config';

import { WarehouseListView } from 'src/sections/warehouse/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Warehouses - ${CONFIG.appName}` };

export default function Page() {
  return <WarehouseListView />;
}
