import { CONFIG } from 'src/global-config';

import { WarehouseCardsView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Home | Warehouses - ${CONFIG.appName}` };

export default function Page() {
  return <WarehouseCardsView />;
}
