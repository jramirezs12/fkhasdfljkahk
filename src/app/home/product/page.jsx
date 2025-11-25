import { CONFIG } from 'src/global-config';

import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Lista de productos | Inicio - ${CONFIG.appName}` };

export default function Page() {
  return <ProductListView />;
}
