import { CONFIG } from 'src/global-config';

import { ProductCreateView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Creación de producto - ${CONFIG.appName}` };

export default function Page() {
  return <ProductCreateView />;
}
