'use client';

import { useTabs } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';

import { HomeContent } from 'src/layouts/home';

import { ProductDetailsReview } from '../components/product-details-review';
import { ProductDetailsSummary } from '../components/product-details-summary';
import { ProductDetailsToolbar } from '../components/product-details-toolbar';
import { ProductDetailsCarousel } from '../components/product-details-carousel';
import { ProductDetailsDescription } from '../components/product-details-description';

// ----------------------------------------------------------------------

export function ProductDetailsView({ product }) {
  const tabs = useTabs('description');

  const [publish, setPublish] = useState('');

  useEffect(() => {
    if (product) {
      setPublish(product?.publish);
    }
  }, [product]);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  return (
    <HomeContent>
      <ProductDetailsToolbar
        backHref={paths.home.product.root}
        liveHref={paths.product.details(`${product?.id}`)}
        publish={publish}
        onChangePublish={handleChangePublish}
        product={product}
      />

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <ProductDetailsCarousel images={product?.images ?? []} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {product && <ProductDetailsSummary product={product} />}
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={[
            (theme) => ({
              px: 3,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {[
            { value: 'description', label: 'Description' },
            { value: 'reviews', label: `Reviews (${product?.reviews.length})` },
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {tabs.value === 'description' && (
          <ProductDetailsDescription description={product?.description ?? ''} />
        )}

        {tabs.value === 'reviews' && (
          <ProductDetailsReview
            ratings={product?.ratings ?? []}
            reviews={product?.reviews ?? []}
            totalRatings={product?.totalRatings ?? 0}
            totalReviews={product?.totalReviews ?? 0}
          />
        )}
      </Card>
    </HomeContent>
  );
}
