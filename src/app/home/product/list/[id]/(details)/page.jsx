import { CONFIG } from 'src/global-config';

import WishlistDetailView from 'src/sections/product/view/wishlist-details-view';


export const metadata = { title: `Detalle de lista de productos | Inicio - ${CONFIG.appName}` };

export default function Page({ params }) {
  const { id } = params;

  return <WishlistDetailView wishlistId={id} />;
}

export async function generateStaticParams() {
  return [];
}
