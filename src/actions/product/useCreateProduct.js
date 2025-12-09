'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProduct } from './createProduct';

/**
 * useCreateProduct
 * - Encapsula la mutación de creación de producto (react-query)
 * - Invalidará caches relevantes ('products-infinite', 'products', 'product:{sku}')
 */
export function useCreateProduct(options = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ['product', 'create'],
    mutationFn: (payload) => createProduct(payload),
    onSuccess: async (data) => {
      // invalidar listados y el producto especifico si recibimos sku
      try {
        if (data?.sku) {
          await qc.invalidateQueries(['product', String(data.sku)]);
        }
        await qc.invalidateQueries(['products-infinite']);
        await qc.invalidateQueries(['products']);
      } catch (e) {
        // no bloquear por invalidation errors
        console.warn('useCreateProduct:onSuccess invalidation failed', e);
      }
      if (typeof options.onSuccess === 'function') options.onSuccess(data);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
      // además, loguear
      console.error('useCreateProduct error:', err);
    },
    ...options,
  });
}

export default useCreateProduct;
