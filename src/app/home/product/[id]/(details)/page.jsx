import { CONFIG } from 'src/global-config';
import { getProduct } from 'src/actions/product/product-ssr';

import { ProductDetailsView } from 'src/sections/product/view';

export const metadata = { title: `Product details | Home - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const { id } = await params;

  let productData;
  try {
    productData = await getProduct(id);
  } catch (err) {
    console.error('[Page getProduct] Error:', err);
    return (
      <div style={{ padding: 24 }}>
        Error cargando el producto.
      </div>
    );
  }

  const { product } = productData || {};

  if (!product) {
    return <div style={{ padding: 24 }}>Producto no encontrado.</div>;
  }

  return <ProductDetailsView product={product} />;
}

export async function generateStaticParams() {
  // Mantén vacío si no haces pre-render estático de múltiples SKUs
  return [];
}
