'use client';

import { HomeContent } from 'src/layouts/home';

import { ProductDetailsSkeleton } from 'src/sections/product/components/product-skeleton';

// ----------------------------------------------------------------------

export default function Loading() {
  return (
    <HomeContent sx={{ pt: 5 }}>
      <ProductDetailsSkeleton />
    </HomeContent>
  );
}
