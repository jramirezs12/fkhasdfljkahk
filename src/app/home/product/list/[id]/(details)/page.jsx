import { notFound } from 'next/navigation';

import { CONFIG } from 'src/global-config';

import WishlistDetailView from 'src/sections/product/view/wishlist-details-view';

export const metadata = { title: `Detalle de lista de productos | Inicio - ${CONFIG.appName}` };

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {

  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams || {};

  if (!id) {
    return notFound();
  }

  return <WishlistDetailView wishlistId={String(id)} />;
}

export async function generateStaticParams() {
  return [];
}
