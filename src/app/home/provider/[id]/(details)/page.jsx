import { CONFIG } from 'src/global-config';
import { getProviderProducts } from 'src/actions/product/provider-ssr';

import { ProviderProfileView } from 'src/sections/provider/view/provider-profile-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Provider profile | Home - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const { id } = params || {};

  if (!id) {
    return <div style={{ padding: 24 }}>Proveedor no especificado.</div>;
  }

  let data;
  try {
    data = await getProviderProducts(String(id));
  } catch (err) {
    console.error('[Page getProviderProducts] Error:', err);
    return <div style={{ padding: 24 }}>Error cargando el perfil del proveedor.</div>;
  }

  const { provider, products } = data || {};

  if (!products || products.length === 0) {
    // Mostrar perfil con mensaje si no hay productos
    return <ProviderProfileView provider={provider} products={[]} />;
  }

  return <ProviderProfileView provider={provider} products={products} />;
}

export async function generateStaticParams() {
  // Mantén vacío si no haces pre-render estático
  return [];
}
