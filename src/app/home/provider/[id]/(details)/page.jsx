import { notFound } from 'next/navigation';

import { CONFIG } from 'src/global-config';
import { getProviderProducts } from 'src/actions/product/provider-ssr';

import { ProviderProfileView } from 'src/sections/provider/view/provider-profile-view';

export const metadata = { title: `Provider profile | Home - ${CONFIG.appName}` };

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams || {};

  if (!id) {
    return notFound();
  }

  let data;
  try {
    data = await getProviderProducts(String(id), { currentPage: 1, pageSize: 24 });
  } catch (err) {
    console.error('[Page getProviderProducts] Error:', err);
    return (
      <div style={{ padding: 24 }}>
        Error cargando el perfil del proveedor.
      </div>
    );
  }

  const { provider, products } = data || {};

  if (!products || products.length === 0) {
    return <ProviderProfileView provider={provider} products={[]} />;
  }

  return <ProviderProfileView provider={provider} products={products} />;
}

export async function generateStaticParams() {
  return [];
}
