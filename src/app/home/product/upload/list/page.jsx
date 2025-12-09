import { CONFIG } from 'src/global-config';

import { UploadProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Actualización de producto - ${CONFIG.appName}` };

export default function Page() {
  return <UploadProductListView />;
}
