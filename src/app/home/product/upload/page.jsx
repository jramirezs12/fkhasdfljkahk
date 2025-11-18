import { CONFIG } from 'src/global-config';

import { UploadProductView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Actualización de producto - ${CONFIG.appName}` };

export default function Page() {
  return <UploadProductView />;
}
