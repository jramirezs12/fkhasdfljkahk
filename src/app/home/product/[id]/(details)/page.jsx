export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { CONFIG } from 'src/global-config';
import { getProduct } from 'src/actions/product/product-ssr';

import { ProductDetailsView } from 'src/sections/product/view';

export const metadata = { title: `Product details | Home - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;

  // Obtén producto (función SSR sin server action)
  const { product, error } = await getProduct(id);

  if (error) {
    // Fallback simple (evita romper el árbol de Server Components)
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <strong>Error:</strong> {error.message}
      </div>
    );
  }

  if (!product) {
    return <div style={{ padding: 24 }}>Producto no encontrado.</div>;
  }

  return <ProductDetailsView product={product} />;
}

// Elimina generateStaticParams si NO prerenderas SKUs
// Si en algún momento necesitas prerender estático, vuelve a definirlo con la lista de ids.
// generateStaticParams() removido para forzar totalmente dinámico.
