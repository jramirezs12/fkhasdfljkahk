'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useWarehousesStore } from 'src/store/warehousesStore';

import createWarehouseFn from './createWarehouse';

/**
 * Hook useCreateWarehouse - returns react-query mutation
 * - onSuccess invalidates warehouses list and updates zustand store
 */
export function useCreateWarehouse(options = {}) {
  const qc = useQueryClient();
  const setWarehouse = useWarehousesStore((s) => s.setWarehouse);

  return useMutation({
    mutationKey: ['warehouse', 'create'],
    mutationFn: (payload) => createWarehouseFn(payload),
    onSuccess: async (created) => {
      try {
        // set in local store for instant UI
        setWarehouse(created);
      } catch { /* empty */ }
      // invalidate query so list refetches
      await qc.invalidateQueries({ queryKey: ['warehouses'] });
      if (typeof options.onSuccess === 'function') options.onSuccess(created);
    },
    onError: (err) => {
      if (typeof options.onError === 'function') options.onError(err);
      console.error('useCreateWarehouse error:', err);
    },
    ...options,
  });
}

export default useCreateWarehouse;
